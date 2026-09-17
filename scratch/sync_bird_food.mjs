/**
 * Bird Food Sync Script
 * Fetches active bird food products from Odoo and syncs them to Sanity.
 * - Updates name, price, stock for existing products
 * - Creates new products if they don't exist in Sanity
 * - Removes (deletes) Sanity products whose Odoo counterparts are now archived
 * 
 * Run with: node --require dotenv/config scratch/sync_bird_food.mjs
 * Or set env vars manually.
 */

import { createClient } from "@sanity/client";

const ODOO_URL = process.env.ODOO_URL || "https://erp.stephanspetstore.co.tz";
const ODOO_DB = process.env.ODOO_DB || "Stephans";
const ODOO_USER = process.env.ODOO_USER || "info@stephanspetstore.co.tz";
const ODOO_PASSWORD = process.env.ODOO_PASSWORD || "Stephan@3202";

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "ubqcgegx";
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const SANITY_WRITE_TOKEN = process.env.SANITY_API_WRITE_TOKEN;

const sanity = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: "2025-12-05",
  useCdn: false,
  token: SANITY_WRITE_TOKEN,
});

// ─── Odoo helpers ────────────────────────────────────────────────────────────

async function odooAuth() {
  const res = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", method: "call", id: 1,
      params: {
        service: "common", method: "authenticate",
        args: [ODOO_DB, ODOO_USER, ODOO_PASSWORD, {}]
      }
    })
  });
  const data = await res.json();
  if (!data.result) throw new Error("Odoo auth failed");
  console.log(`✅ Odoo auth OK (UID=${data.result})`);
  return data.result;
}

async function odooRPC(uid, model, method, args, kwargs = {}) {
  const res = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", method: "call", id: Date.now(),
      params: {
        service: "object", method: "execute_kw",
        args: [ODOO_DB, uid, ODOO_PASSWORD, model, method, args, kwargs]
      }
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.data?.message || data.error.message);
  return data.result;
}

// ─── Image upload ─────────────────────────────────────────────────────────────

async function uploadImage(base64, filename) {
  if (!base64 || base64.length < 100) return null;
  try {
    const buffer = Buffer.from(base64, "base64");
    const asset = await sanity.assets.upload("image", buffer, {
      filename: `${filename}.jpg`,
      contentType: "image/jpeg",
    });
    console.log(`  🖼  Uploaded image: ${asset._id}`);
    return asset._id;
  } catch (err) {
    console.error(`  ⚠️  Image upload failed: ${err.message}`);
    return null;
  }
}

// ─── Category helper ──────────────────────────────────────────────────────────

async function getOrCreateCategory(name) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const existing = await sanity.fetch(
    `*[_type == "category" && slug.current == $slug][0]{_id}`, { slug }
  );
  if (existing) return existing._id;
  const created = await sanity.create({
    _type: "category",
    title: name,
    slug: { _type: "slug", current: slug },
    order: 0
  });
  console.log(`  📁  Created category: ${name} (${created._id})`);
  return created._id;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🦜  Bird Food Sync — Odoo → Sanity\n");

  if (!SANITY_WRITE_TOKEN) {
    throw new Error("SANITY_API_WRITE_TOKEN is not set");
  }

  const uid = await odooAuth();

  // 1. Get ALL category IDs under BIRDS subtree from Odoo
  console.log("\n📋  Fetching Odoo categories...");
  const allCats = await odooRPC(uid, "product.category", "search_read",
    [[]], { fields: ["id", "name", "display_name", "parent_id"] }
  );

  // Find BIRDS root
  const birdsRoot = allCats.find(c => !c.parent_id && c.name === "BIRDS");
  if (!birdsRoot) throw new Error("Could not find BIRDS root category in Odoo");
  console.log(`  ✅  BIRDS root: id=${birdsRoot.id}`);

  // Collect all BIRDS descendants
  const birdCatIds = new Set();
  const catById = new Map(allCats.map(c => [c.id, c]));
  function collectDescendants(parentId) {
    birdCatIds.add(parentId);
    for (const cat of allCats) {
      if (cat.parent_id && cat.parent_id[0] === parentId) {
        collectDescendants(cat.id);
      }
    }
  }
  collectDescendants(birdsRoot.id);

  // Find food-related categories specifically under BIRDS
  const birdFoodCats = [...birdCatIds].filter(id => {
    const cat = catById.get(id);
    return cat && (
      cat.name.toLowerCase().includes("food") ||
      cat.name.toLowerCase().includes("parrot") ||
      cat.display_name.toLowerCase().includes("food")
    );
  });

  console.log(`  📂  Bird food category IDs: ${[...birdFoodCats].join(", ")}`);
  console.log(`  📂  All bird category IDs: ${[...birdCatIds].join(", ")}`);

  // 2. Fetch ACTIVE bird food products from Odoo
  console.log("\n🔍  Fetching active bird food products from Odoo...");
  const activeOdooProducts = await odooRPC(uid, "product.template", "search_read",
    [[
      ["sale_ok", "=", true],
      ["active", "=", true],
      ["categ_id", "in", [...birdCatIds]]
    ]],
    {
      fields: ["id", "name", "list_price", "qty_available", "categ_id", "image_1920", "description_sale"],
    }
  );

  console.log(`  ✅  Found ${activeOdooProducts.length} active bird products in Odoo`);
  for (const p of activeOdooProducts) {
    console.log(`     - [${p.id}] ${p.name} | Price: ${p.list_price} | Stock: ${p.qty_available} | Cat: ${p.categ_id?.[1]}`);
  }

  // 3. Fetch ARCHIVED bird products from Odoo (to know what to remove from Sanity)
  console.log("\n🗄️  Fetching archived bird products from Odoo...");
  const archivedOdooProducts = await odooRPC(uid, "product.template", "search_read",
    [[
      ["active", "=", false],
      ["categ_id", "in", [...birdCatIds]]
    ]],
    { fields: ["id", "name"] }
  );
  const archivedIds = new Set(archivedOdooProducts.map(p => p.id));
  console.log(`  ⚠️  Found ${archivedOdooProducts.length} archived bird products in Odoo`);
  for (const p of archivedOdooProducts) {
    console.log(`     - [${p.id}] ${p.name}`);
  }

  // 4. Fetch current Sanity bird food products
  console.log("\n🔍  Fetching bird products from Sanity...");
  const sanityBirdProducts = await sanity.fetch(`
    *[_type == "product" && (
      defined(odooId) ||
      _id match "odoo-*"
    )] {
      _id,
      odooId,
      name,
      price,
      stock,
      "categories": categories[]->{_id, title, "slug": slug.current}
    }
  `);

  // Filter to only bird-related ones
  const sanityBirdOnly = sanityBirdProducts.filter(p => {
    const isBirdById = p._id?.startsWith("odoo-") && 
      activeOdooProducts.some(op => `odoo-${op.id}` === p._id) ||
      archivedOdooProducts.some(ap => `odoo-${ap.id}` === p._id);
    const isBirdByCat = p.categories?.some(c => 
      c.slug?.includes("bird") || c.title?.toLowerCase().includes("bird") ||
      c.title?.toLowerCase().includes("parrot")
    );
    return isBirdById || isBirdByCat;
  });
  console.log(`  ✅  Found ${sanityBirdOnly.length} bird products in Sanity`);

  // 5. Remove archived products from Sanity
  console.log("\n🗑️  Removing archived/duplicate products from Sanity...");
  let removed = 0;
  for (const archived of archivedOdooProducts) {
    const sanityId = `odoo-${archived.id}`;
    try {
      const existing = await sanity.fetch(`*[_id == $id][0]{_id}`, { id: sanityId });
      if (existing) {
        await sanity.delete(sanityId);
        console.log(`  ✅  Deleted: ${sanityId} (${archived.name})`);
        removed++;
      }
    } catch (err) {
      console.error(`  ❌  Failed to delete ${sanityId}: ${err.message}`);
    }
  }
  console.log(`  → Removed ${removed} archived products from Sanity`);

  // 6. Sync active products to Sanity
  console.log("\n🔄  Syncing active bird products to Sanity...");
  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const product of activeOdooProducts) {
    const sanityId = `odoo-${product.id}`;
    const slug = product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") + `-${product.id}`;

    try {
      // Category
      let categoryRef = undefined;
      if (product.categ_id && Array.isArray(product.categ_id)) {
        const fullPath = product.categ_id[1];
        const leafName = fullPath.includes(" / ") ? fullPath.split(" / ").pop() : fullPath;
        const catId = await getOrCreateCategory(leafName);
        categoryRef = [{ _type: "reference", _ref: catId, _key: catId }];
      }

      // Image
      let imageAssetId = null;
      if (product.image_1920) {
        imageAssetId = await uploadImage(product.image_1920, `bird-food-${product.id}`);
      }

      // Create if not exists
      const exists = await sanity.fetch(`*[_id == $id][0]{_id}`, { id: sanityId });
      if (!exists) {
        await sanity.create({
          _type: "product",
          _id: sanityId,
          name: product.name,
          slug: { _type: "slug", current: slug },
          price: product.list_price || 0,
          stock: Math.max(0, Math.floor(product.qty_available || 0)),
          odooId: product.id,
          description: product.description_sale || "",
          ...(categoryRef && { categories: categoryRef }),
          ...(imageAssetId && {
            images: [{
              _type: "image",
              _key: `odoo-img-${product.id}`,
              asset: { _type: "reference", _ref: imageAssetId }
            }]
          })
        });
        console.log(`  ➕  Created: [${product.id}] ${product.name}`);
        created++;
      } else {
        // Update existing
        const patch = sanity.patch(sanityId).set({
          name: product.name,
          price: product.list_price || 0,
          stock: Math.max(0, Math.floor(product.qty_available || 0)),
          odooId: product.id,
          description: product.description_sale || "",
        });
        if (categoryRef) patch.set({ categories: categoryRef });
        if (imageAssetId) {
          patch.set({
            images: [{
              _type: "image",
              _key: `odoo-img-${product.id}`,
              asset: { _type: "reference", _ref: imageAssetId }
            }]
          });
        }
        await patch.commit();
        console.log(`  🔄  Updated: [${product.id}] ${product.name} | Price: ${product.list_price} | Stock: ${Math.floor(product.qty_available)}`);
        updated++;
      }
    } catch (err) {
      console.error(`  ❌  Error syncing [${product.id}] ${product.name}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n✅  Sync Complete!`);
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Removed (archived): ${removed}`);
  console.log(`   Errors: ${errors}`);
}

main().catch(err => {
  console.error("\n💥  Fatal error:", err.message);
  process.exit(1);
});
