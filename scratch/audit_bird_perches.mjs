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
  
  const allCats = await odooRPC(uid, "product.category", "search_read", [[]], { fields: ["id", "name", "display_name", "parent_id"] });
  const birdsRoot = allCats.find(c => !c.parent_id && c.name === "BIRDS");
  const birdCatIds = new Set();
  function collectDescendants(parentId) {
    birdCatIds.add(parentId);
    for (const cat of allCats) { if (cat.parent_id && cat.parent_id[0] === parentId) collectDescendants(cat.id); }
  }
  collectDescendants(birdsRoot.id);
  
  const cageCats = [...birdCatIds].filter(id => { const c = allCats.find(x => x.id === id); return c && (c.name.toLowerCase().includes('perch') || c.name.toLowerCase().includes('access') || c.display_name.toLowerCase().includes('perch') || c.display_name.toLowerCase().includes('access')); });
  console.log("=== BIRD PERCHES & ACCESSORIES CATEGORIES IN ODOO ===");
  for (const id of cageCats) { const c = allCats.find(x => x.id === id); console.log(` [${id}] ${c.display_name}`); }
  
  console.log("\n=== ACTIVE BIRD CAGE PRODUCTS IN ODOO ===");
  const activeCages = await odooRPC(uid, "product.template", "search_read", [[["active", "=", true], ["categ_id", "in", cageCats]]], { fields: ["id", "name", "list_price", "qty_available", "categ_id", "sale_ok"] });
  for (const p of activeCages) { console.log(` [${p.id}] ${p.name} | Price: ${p.list_price} | Stock: ${p.qty_available} | sale_ok: ${p.sale_ok} | Cat: ${p.categ_id?.[1]}`); }
  
  console.log("\n=== ARCHIVED BIRD CAGE PRODUCTS IN ODOO ===");
  const archivedCages = await odooRPC(uid, "product.template", "search_read", [[["active", "=", false], ["categ_id", "in", cageCats]]], { fields: ["id", "name"] });
  for (const p of archivedCages) { console.log(` [${p.id}] ${p.name} (ARCHIVED)`); }
  
  console.log("\n=== SANITY: ALL ODOO-SOURCED PRODUCTS MATCHING BIRD CAGES ===");
  const odooIds = [...activeCages, ...archivedCages].map(p => `odoo-${p.id}`);
  const sanityDocs = await sanity.fetch(`*[_type == "product" && _id in $ids] { _id, name, price, stock, "categories": categories[]->{title, "slug": slug.current} }`, { ids: odooIds });
  for (const p of sanityDocs) { console.log(` [${p._id}] ${p.name} | Price: ${p.price} | Stock: ${p.stock} | Cats: ${p.categories?.map(c=>c.title).join(', ') || 'none'}`); }
  
  console.log("\n=== SYNC STATUS ===");
  for (const op of activeCages) {
    const sp = sanityDocs.find(s => s._id === `odoo-${op.id}`);
    if (!sp) { console.log(`❌ MISSING in Sanity: [${op.id}] ${op.name}`); }
    else {
      const issues = [];
      if (sp.price !== op.list_price) issues.push(`Price: Odoo=${op.list_price} Sanity=${sp.price}`);
      if (Math.floor(sp.stock || 0) !== Math.floor(op.qty_available || 0)) issues.push(`Stock: Odoo=${op.qty_available} Sanity=${sp.stock}`);
      if (issues.length) { console.log(`⚠️  MISMATCH [${op.id}] ${op.name}: ${issues.join(' | ')}`); }
      else { console.log(`✅ OK: [${op.id}] ${op.name} | Price: ${op.list_price} | Stock: ${op.qty_available}`); }
    }
  }
  for (const ap of archivedCages) {
    const sp = sanityDocs.find(s => s._id === `odoo-${ap.id}`);
    if (sp) { console.log(`⚠️  ORPHAN in Sanity (archived in Odoo): [${ap.id}] ${ap.name}`); }
  }
  
  console.log("\n=== SUMMARY ===");
  console.log(`Odoo active cages: ${activeCages.length}`);
  console.log(`Odoo archived cages: ${archivedCages.length}`);
  console.log(`Found in Sanity: ${sanityDocs.length}`);
}

main().catch(err => { console.error("Fatal:", err.message); process.exit(1); });
