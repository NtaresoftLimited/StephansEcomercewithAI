import { createClient } from "@sanity/client";

const ODOO_URL = "https://erp.stephanspetstore.co.tz";
const ODOO_DB = "Stephans";
const ODOO_USER = "info@stephanspetstore.co.tz";
const ODOO_PASSWORD = "Stephan@3202";

const sanity = createClient({
  projectId: "ubqcgegx",
  dataset: "production",
  apiVersion: "2025-12-05",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

async function odooAuth() {
  const res = await fetch(`${ODOO_URL}/jsonrpc`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", method: "call", id: 1, params: { service: "common", method: "authenticate", args: [ODOO_DB, ODOO_USER, ODOO_PASSWORD, {}] } }) });
  const data = await res.json();
  return data.result;
}

async function odooRPC(uid, model, method, args, kwargs = {}) {
  const res = await fetch(`${ODOO_URL}/jsonrpc`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", method: "call", id: Date.now(), params: { service: "object", method: "execute_kw", args: [ODOO_DB, uid, ODOO_PASSWORD, model, method, args, kwargs] } }) });
  const data = await res.json();
  return data.result;
}

async function main() {
  const uid = await odooAuth();
  
  // 1. Fetch ALL active products from Odoo with write_date
  const activeProducts = await odooRPC(uid, "product.template", "search_read", 
    [[["sale_ok", "=", true], ["active", "=", true]]], 
    { fields: ["id", "write_date"] }
  );
  const odooMap = new Map(activeProducts.map(p => [p.id, p.write_date]));

  // 2. Fetch all products from Sanity
  const sanityDocs = await sanity.fetch(`*[_type == "product" && (defined(odooId) || _id match "odoo-*")] { _id, odooId }`);
  
  console.log(`Found ${sanityDocs.length} products in Sanity to backfill.`);
  
  let count = 0;
  for (const doc of sanityDocs) {
      let odooId = doc.odooId || parseInt(doc._id.replace("odoo-", ""), 10);
      
      // SKIP the mixed up Cat Bowls so they get fully re-synced (images replaced)
      if ([1026, 1027, 884].includes(odooId)) {
          console.log(`Skipping Cat Bowl ${odooId} so it gets re-synced!`);
          continue;
      }
      
      const writeDate = odooMap.get(odooId);
      if (writeDate) {
          await sanity.patch(doc._id).set({ odooLastModified: writeDate }).commit();
          count++;
          if (count % 10 === 0) console.log(`Backfilled ${count} products...`);
      }
  }
  
  console.log("Done backfilling! Now the automatic sync won't timeout.");
}

main().catch(err => { console.error("Fatal:", err.message); process.exit(1); });
