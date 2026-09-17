
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

async function run() {
    // 1. Get all products from Odoo in "Adult Dog Food" (1200) and "Food Bowls" (1127)
    console.log("Fetching from Odoo...");
    const authRes = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0", method: "call", params: { service: "common", method: "login", args: [DB, USER, PASS] }, id: 1
        })
    });
    const uid = (await authRes.json()).result;

    const prodRes = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0", method: "call", params: {
                service: "object", method: "execute_kw",
                args: [DB, uid, PASS, "product.template", "search_read", [[["categ_id", "in", [1200, 1127]]]], { fields: ["name", "categ_id"] }]
            }, id: 3
        })
    });
    const odooProducts = (await prodRes.json()).result;
    console.log(`Found ${odooProducts.length} products in Odoo for these categories.`);

    const transaction = client.transaction();
    let updates = 0;

    for (const p of odooProducts) {
        const catId = `category-odoo-${p.categ_id[0]}`;
        const sanityId = `odoo-${p.id}`;
        
        transaction.patch(sanityId, {
            set: {
                categories: [{
                    _key: Math.random().toString(36).substring(2, 9),
                    _type: "reference",
                    _ref: catId
                }]
            }
        });
        updates++;
    }
    
    if (updates > 0) {
        console.log(`Committing ${updates} category updates to Sanity...`);
        await transaction.commit();
        console.log("Success!");
    }
}
run();

