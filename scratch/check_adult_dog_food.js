
const ODOO_URL = "https://erp.stephanspetstore.co.tz";
const DB = "Stephans";
const USER = "info@stephanspetstore.co.tz";
const PASS = "Stephan@3202";

async function runOdoo() {
    console.log("Connecting to Odoo...");
    const authRes = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0", method: "call", params: { service: "common", method: "login", args: [DB, USER, PASS] }, id: 1
        })
    });
    const uid = (await authRes.json()).result;

    // Get "Adult Dog Food" category in Odoo
    const catRes = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0", method: "call", params: {
                service: "object", method: "execute_kw",
                args: [DB, uid, PASS, "product.category", "search_read", [[["name", "=", "Adult Dog Food"]]], { fields: ["name", "parent_id"] }]
            }, id: 2
        })
    });
    const categories = (await catRes.json()).result;
    
    if (categories.length === 0) {
        console.log("Odoo: Adult Dog Food category NOT FOUND.");
        return [];
    }
    
    const catId = categories[0].id;
    console.log("Odoo Category ID:", catId);
    
    // Get products in this category
    const prodRes = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0", method: "call", params: {
                service: "object", method: "execute_kw",
                args: [DB, uid, PASS, "product.template", "search_read", [[["categ_id", "child_of", catId], ["active", "=", true]]], { fields: ["name"] }]
            }, id: 3
        })
    });
    const products = (await prodRes.json()).result;
    console.log(`Odoo has ${products.length} active products under Adult Dog Food.`);
    return products.map(p => p.name);
}

const sanityClient = require("@sanity/client");
require("dotenv").config({ path: ".env" });
const client = sanityClient.createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    useCdn: false,
    apiVersion: "2023-05-03",
    token: process.env.SANITY_API_WRITE_TOKEN,
});

async function runSanity() {
    console.log("Connecting to Sanity...");
    // Find category in Sanity
    const cats = await client.fetch(`*[_type == "category" && title match "Adult Dog Food"]{ _id, title }`);
    if (cats.length === 0) {
        console.log("Sanity: Adult Dog Food category NOT FOUND.");
        return [];
    }
    const catId = cats[0]._id;
    console.log("Sanity Category ID:", catId);
    
    // Find products referencing this category in categories array
    const prods = await client.fetch(`*[_type == "product" && references($catId)]{ name }`, { catId });
    console.log(`Sanity has ${prods.length} products under Adult Dog Food.`);
    return prods.map(p => p.name);
}

async function main() {
    const odooNames = await runOdoo();
    const sanityNames = await runSanity();
    
    console.log("\n--- Comparison ---");
    const missingInSanity = odooNames.filter(n => !sanityNames.includes(n));
    console.log(`Missing in Sanity (${missingInSanity.length}):`, missingInSanity.slice(0, 5));
}
main();

