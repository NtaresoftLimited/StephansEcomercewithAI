
const ODOO_URL = "https://erp.stephanspetstore.co.tz";
const DB = "Stephans";
const USER = "info@stephanspetstore.co.tz";
const PASS = "Stephan@3202";
const sanityClient = require("@sanity/client");
require("dotenv").config({ path: ".env" });

const client = sanityClient.createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    useCdn: false,
    apiVersion: "2023-05-03",
    token: process.env.SANITY_API_WRITE_TOKEN,
});

async function rpc(uid, model, method, args, kwargs) {
    const res = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0", method: "call", params: {
                service: "object", method: "execute_kw",
                args: [DB, uid, PASS, model, method, args, kwargs || {}]
            }, id: Math.random()
        })
    });
    const data = await res.json();
    if (data.error) throw new Error(JSON.stringify(data.error));
    return data.result;
}

async function main() {
    const authRes = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: { service: "common", method: "login", args: [DB, USER, PASS] }, id: 1 })
    });
    const uid = (await authRes.json()).result;

    // Find "Food & Water Dispensers" category
    const cats = await rpc(uid, "product.category", "search_read", [[["name", "ilike", "Food & Water Dispensers"]]], { fields: ["name", "parent_id", "complete_name"] });
    console.log("=== Odoo Food & Water Dispensers Categories ===");
    cats.forEach(c => console.log(`  ID: ${c.id} | ${c.complete_name}`));
    
    const dogCat = cats.find(c => c.complete_name && c.complete_name.includes("DOGS"));
    if (!dogCat) {
        console.log("ERROR: No Food & Water Dispensers category found under DOGS");
        // Try broader search
        const allCats = await rpc(uid, "product.category", "search_read", [[["complete_name", "ilike", "DOGS%BOWLS"]]], { fields: ["name", "parent_id", "complete_name"] });
        console.log("\nAll DOGS BOWLS categories:");
        allCats.forEach(c => console.log(`  ID: ${c.id} | ${c.complete_name}`));
        return;
    }
    console.log(`\nUsing category: ${dogCat.complete_name} (ID: ${dogCat.id})`);

    // Get products
    const odooProducts = await rpc(uid, "product.template", "search_read", [[["categ_id", "child_of", dogCat.id], ["active", "=", true]]], { fields: ["name", "list_price", "categ_id"] });
    
    console.log(`\n=== Odoo Products (${odooProducts.length}) ===`);
    odooProducts.sort((a, b) => a.name.localeCompare(b.name));
    odooProducts.forEach(p => console.log(`  [${p.id}] ${p.name} - ${p.list_price} TSh`));

    // Now check Sanity - find category by slug
    const sanityCats = await client.fetch(`*[_type == "category" && (slug.current == "food-water-dispensers" || _id == $catId)]{ _id, title, slug }`, { catId: `category-odoo-${dogCat.id}` });
    console.log(`\n=== Sanity Categories ===`);
    sanityCats.forEach(c => console.log(`  ${c._id} | ${c.title} | slug: ${c.slug?.current}`));

    const catRef = sanityCats.length > 0 ? sanityCats[0]._id : null;
    
    if (catRef) {
        const sanityProducts = await client.fetch(`*[_type == "product" && references($catId)]{ _id, name, price }`, { catId: catRef });
        console.log(`\n=== Sanity Products (${sanityProducts.length}) ===`);
        sanityProducts.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        sanityProducts.forEach(p => console.log(`  ${p._id} | ${p.name} - ${p.price} TSh`));
        
        // Compare
        const odooNames = odooProducts.map(p => p.name).sort();
        const sanityNames = sanityProducts.map(p => p.name).sort();
        
        const missingInSanity = odooNames.filter(n => !sanityNames.includes(n));
        const extraInSanity = sanityNames.filter(n => !odooNames.includes(n));
        
        console.log(`\n=== Sync Summary ===`);
        console.log(`Odoo: ${odooProducts.length} products`);
        console.log(`Sanity: ${sanityProducts.length} products`);
        if (missingInSanity.length > 0) {
            console.log(`\nMissing in Sanity (${missingInSanity.length}):`);
            missingInSanity.forEach(n => console.log(`  ❌ ${n}`));
        }
        if (extraInSanity.length > 0) {
            console.log(`\nExtra in Sanity (not in Odoo) (${extraInSanity.length}):`);
            extraInSanity.forEach(n => console.log(`  ⚠️ ${n}`));
        }
        if (missingInSanity.length === 0 && extraInSanity.length === 0) {
            console.log(`\n✅ Perfectly synced!`);
        }
    } else {
        console.log("Could not find matching Sanity category.");
    }
}
main().catch(console.error);

