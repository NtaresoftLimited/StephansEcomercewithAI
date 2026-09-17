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
  if (!data.result) throw new Error("Odoo auth failed");
  return data.result;
}

async function odooRPC(uid, model, method, args, kwargs = {}) {
  const res = await fetch(`${ODOO_URL}/jsonrpc`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", method: "call", id: Date.now(), params: { service: "object", method: "execute_kw", args: [ODOO_DB, uid, ODOO_PASSWORD, model, method, args, kwargs] } }) });
  const data = await res.json();
  if (data.error) throw new Error(data.error.data?.message || data.error.message);
  return data.result;
}

async function main() {
  const uid = await odooAuth();
  
  // Find products matching "storage container"
  console.log("\n=== ODOO: 'storage container' PRODUCTS ===");
  const activeProducts = await odooRPC(uid, "product.template", "search_read", 
    [[["active", "=", true], ["name", "ilike", "storage container"]]], 
    { fields: ["id", "name", "categ_id"] }
  );
  
  for (const p of activeProducts) { 
      console.log(` [${p.id}] ${p.name} | Cat: ${p.categ_id?.[1]}`); 
  }
  
  console.log("\n=== SANITY: 'storage container' PRODUCTS ===");
  const odooIds = activeProducts.map(p => `odoo-${p.id}`);
  const sanityDocs = await sanity.fetch(`*[_type == "product" && _id in $ids] { _id, name, odooLastModified, "imageUrl": images[0].asset->url }`, { ids: odooIds });
  
  for (const p of sanityDocs) { 
      console.log(` [${p._id}] ${p.name} | Last Modified: ${p.odooLastModified || 'NONE'} | Image: ${p.imageUrl}`); 
  }
  
}

main().catch(err => { console.error("Fatal:", err.message); process.exit(1); });
