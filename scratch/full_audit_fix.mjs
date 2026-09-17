/**
 * Full Audit + Fix Script
 * 1. Fetch ALL active Odoo product IDs
 * 2. Find Sanity products with no active Odoo match → delete them
 * 3. Find Sanity products with missing images or odooLastModified=null → re-upload from Odoo
 * Odoo is source of truth. No Odoo changes.
 */

import { createClient } from "@sanity/client";

const ODOO_URL = "https://erp.stephanspetstore.co.tz";
const ODOO_DB = "Stephans";
const ODOO_USER = "info@stephanspetstore.co.tz";
const ODOO_PASS = "Stephan@3202";
const SANITY_PROJECT = "ubqcgegx";
const SANITY_DATASET = "production";
const SANITY_TOKEN = process.env.SANITY_API_WRITE_TOKEN;

const sanity = createClient({
  projectId: SANITY_PROJECT,
  dataset: SANITY_DATASET,
  apiVersion: "2025-12-05",
  useCdn: false,
  token: SANITY_TOKEN,
});

// ── Odoo helpers ──────────────────────────────────────────────────────────────

async function odooAuth() {
  const r = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: { service: "common", method: "authenticate", args: [ODOO_DB, ODOO_USER, ODOO_PASS, {}] } }),
  });
  const d = await r.json();
  if (!d.result) throw new Error("Odoo auth failed");
  console.log(`✅ Odoo authenticated (uid=${d.result})`);
  return d.result;
}

async function odooCall(uid, model, method, args, kwargs = {}) {
  const r = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: { service: "object", method: "execute_kw", args: [ODOO_DB, uid, ODOO_PASS, model, method, args, kwargs] } }),
  });
  const d = await r.json();
  if (d.error) throw new Error(JSON.stringify(d.error));
  return d.result;
}

async function fetchAllOdooIds(uid) {
  // Fetch in pages to avoid timeouts
  const ids = [];
  let offset = 0;
  const limit = 200;
  while (true) {
    const batch = await odooCall(uid, "product.template", "search", [[["active", "=", true]]], { limit, offset });
    if (!batch || batch.length === 0) break;
    ids.push(...batch);
    offset += batch.length;
    if (batch.length < limit) break;
  }
  return ids;
}

async function fetchOdooProducts(uid, ids) {
  const results = [];
  const chunkSize = 50;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const batch = await odooCall(uid, "product.template", "search_read", [[["id", "in", chunk]]], { fields: ["id", "name", "image_1920", "write_date"] });
    results.push(...batch);
    process.stdout.write(`\r  Fetching Odoo products: ${Math.min(i + chunkSize, ids.length)}/${ids.length}`);
  }
  console.log();
  return results;
}

// ── Sanity helpers ────────────────────────────────────────────────────────────

async function fetchAllSanityProducts() {
  const results = [];
  let start = 0;
  const step = 500;
  while (true) {
    const batch = await sanity.fetch(
      `*[_type == "product" && _id match "odoo-*"][$start...$end] {
        _id,
        name,
        odooLastModified,
        "hasImage": defined(images[0].asset),
        "imageUrl": images[0].asset->url
      }`,
      { start, end: start + step }
    );
    if (!batch || batch.length === 0) break;
    results.push(...batch);
    start += batch.length;
    process.stdout.write(`\r  Fetching Sanity products: ${results.length}`);
    if (batch.length < step) break;
  }
  console.log();
  return results;
}

async function uploadImageToSanity(base64, filename) {
  const buf = Buffer.from(base64, "base64");
  const asset = await sanity.assets.upload("image", buf, { filename: `${filename}.jpg`, contentType: "image/jpeg" });
  return asset._id;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const DRY_RUN = process.argv.includes("--dry-run");
  if (DRY_RUN) console.log("⚠️  DRY RUN — no changes will be made\n");

  console.log("\n=== STEP 1: Authenticate with Odoo ===");
  const uid = await odooAuth();

  console.log("\n=== STEP 2: Fetch all active Odoo product IDs ===");
  const activeOdooIds = await fetchAllOdooIds(uid);
  const activeOdooIdSet = new Set(activeOdooIds.map(String));
  console.log(`  Found ${activeOdooIds.length} active products in Odoo`);

  console.log("\n=== STEP 3: Fetch all Sanity odoo-* products ===");
  const sanityProducts = await fetchAllSanityProducts();
  console.log(`  Found ${sanityProducts.length} odoo-* products in Sanity`);

  // ── Phase A: Find archived products in Sanity (not in active Odoo) ──────────
  console.log("\n=== PHASE A: Find archived/deleted products to remove from Sanity ===");
  const toDelete = sanityProducts.filter((sp) => {
    const odooId = sp._id.replace("odoo-", "");
    return !activeOdooIdSet.has(odooId);
  });

  console.log(`  Found ${toDelete.length} products to delete from Sanity:`);
  for (const p of toDelete) {
    console.log(`    ❌ DELETE [${p._id}] ${p.name}`);
  }

  if (!DRY_RUN && toDelete.length > 0) {
    let tx = sanity.transaction();
    for (const p of toDelete) tx = tx.delete(p._id);
    await tx.commit();
    console.log(`  ✅ Deleted ${toDelete.length} archived products from Sanity`);
  }

  // ── Phase B: Find products needing image refresh ─────────────────────────────
  console.log("\n=== PHASE B: Find products needing image refresh ===");
  const toRefresh = sanityProducts.filter((sp) => {
    const odooId = sp._id.replace("odoo-", "");
    if (!activeOdooIdSet.has(odooId)) return false; // already being deleted
    return !sp.hasImage || !sp.odooLastModified;
  });

  console.log(`  Found ${toRefresh.length} products needing image refresh`);
  for (const p of toRefresh) {
    const reason = !p.hasImage ? "NO IMAGE" : "odooLastModified=null";
    console.log(`    🔄 REFRESH [${p._id}] ${p.name} — reason: ${reason}`);
  }

  if (!DRY_RUN && toRefresh.length > 0) {
    // Fetch the Odoo data for these products
    const refreshIds = toRefresh.map((sp) => parseInt(sp._id.replace("odoo-", ""), 10));
    console.log(`\n  Fetching full Odoo data for ${refreshIds.length} products...`);
    const odooProducts = await fetchOdooProducts(uid, refreshIds);
    const odooMap = new Map(odooProducts.map((p) => [p.id, p]));

    let successCount = 0;
    let failCount = 0;
    for (const sp of toRefresh) {
      const odooId = parseInt(sp._id.replace("odoo-", ""), 10);
      const op = odooMap.get(odooId);
      if (!op) { console.log(`  ⚠️  No Odoo data for ${sp._id}`); failCount++; continue; }

      try {
        if (!op.image_1920) {
          console.log(`  ⚠️  [${sp._id}] ${op.name} — no image in Odoo either, skipping`);
          failCount++;
          continue;
        }

        process.stdout.write(`  Uploading image for [${sp._id}] ${op.name}...`);
        const assetId = await uploadImageToSanity(op.image_1920, `product-${odooId}`);

        await sanity.patch(sp._id).set({
          "images": [{ _type: "image", _key: `img-${odooId}`, asset: { _type: "reference", _ref: assetId } }],
          "odooLastModified": op.write_date,
        }).commit();

        console.log(` ✅ Done`);
        successCount++;
      } catch (err) {
        console.log(` ❌ Failed: ${err.message}`);
        failCount++;
      }
    }
    console.log(`\n  Image refresh: ${successCount} succeeded, ${failCount} failed`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n=== SUMMARY ===");
  console.log(`  Total Sanity products:       ${sanityProducts.length}`);
  console.log(`  Active Odoo products:        ${activeOdooIds.length}`);
  console.log(`  Deleted (archived in Odoo):  ${toDelete.length}`);
  console.log(`  Image refreshed:             ${toRefresh.length}`);
  console.log(`\nDone! ✅`);
}

main().catch((err) => { console.error("Fatal error:", err); process.exit(1); });
