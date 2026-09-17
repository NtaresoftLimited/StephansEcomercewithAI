
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
    // Login
    const authRes = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: { service: "common", method: "login", args: [DB, USER, PASS] }, id: 1 })
    });
    const uid = (await authRes.json()).result;

    // Find "Wet Food" category under Dogs > Food
    const cats = await rpc(uid, "product.category", "search_read", [[["name", "=", "Wet Food"]]], { fields: ["name", "parent_id", "complete_name"] });
    console.log("=== Odoo Wet Food Categories ===");
    cats.forEach(c => console.log(`  ID: ${c.id} | ${c.complete_name}`));
    
    // Find the one under DOGS / FOOD
    const dogWetFood = cats.find(c => c.complete_name && c.complete_name.includes("DOGS") && c.complete_name.includes("FOOD"));
    if (!dogWetFood) {
        console.log("ERROR: No Wet Food category found under DOGS / FOOD");
        return;
    }
    console.log(`\nUsing category: ${dogWetFood.complete_name} (ID: ${dogWetFood.id})`);

    // Get products in this category (child_of to include subcategories)
    const odooProducts = await rpc(uid, "product.template", "search_read", [[["categ_id", "child_of", dogWetFood.id], ["active", "=", true]]], { fields: ["name", "list_price", "categ_id"] });
    
    console.log(`\n=== Odoo Products (${odooProducts.length}) ===`);
    odooProducts.sort((a, b) => a.name.localeCompare(b.name));
    odooProducts.forEach(p => console.log(`  [${p.id}] ${p.name} - ${p.list_price} TSh`));

    // Now check Sanity
    // First find the category
    const sanityCats = await client.fetch(`*[_type == "category" && title match "Wet Food"]{ _id, title, slug }`);
    console.log(`\n=== Sanity Wet Food Categories ===`);
    sanityCats.forEach(c => console.log(`  ${c._id} | ${c.title} | slug: ${c.slug?.current}`));

    // Find the one that matches
    const sanityCat = sanityCats.find(c => c._id === `category-odoo-${dogWetFood.id}`);
    if (!sanityCat) {
        console.log(`WARNING: Sanity category for odoo ID ${dogWetFood.id} not found. Looking by title...`);
    }
    
    const catRef = sanityCat ? sanityCat._id : (sanityCats[0] ? sanityCats[0]._id : null);
    
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

