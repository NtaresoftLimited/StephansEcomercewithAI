
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

    const res = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0", method: "call", params: {
                service: "object", method: "execute_kw",
                args: [DB, uid, PASS, "product.category", "search_read", [[]], { fields: ["name", "parent_id"] }]
            }, id: 2
        })
    });
    const categories = (await res.json()).result;
    
    // Find categories to delete
    const toDeleteNames = ["Hygiene & care", "Toys & enrichment", "Travel essential", "Treats & supplement", "Cat Litter and Hygiene"];
    const toDeleteIds = categories
        .filter(c => toDeleteNames.some(n => c.name.toLowerCase().includes(n.toLowerCase())))
        .map(c => c.id);
        
    console.log("Odoo categories to delete:", toDeleteIds);
    if (toDeleteIds.length > 0) {
        const delRes = await fetch(`${ODOO_URL}/jsonrpc`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0", method: "call", params: {
                    service: "object", method: "execute_kw",
                    args: [DB, uid, PASS, "product.category", "unlink", [toDeleteIds]]
                }, id: 3
            })
        });
        console.log("Odoo unlink result:", JSON.stringify(await delRes.json()));
    }
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
    const cats = await client.fetch(`*[_type == "category"]{ _id, title }`);
    
    const toDeleteNames = ["Hygiene & care", "Toys & enrichment", "Travel essential", "Treats & supplement", "Cat Litter and Hygiene"];
    const toDeleteIds = cats
        .filter(c => toDeleteNames.some(n => c.title.toLowerCase().includes(n.toLowerCase())))
        .map(c => c._id);
        
    console.log("Sanity categories to delete:", toDeleteIds);
    
    for (const id of toDeleteIds) {
        try {
            await client.delete(id);
            console.log("Deleted Sanity category:", id);
        } catch(e) {
            console.log("Failed to delete", id, e.message);
        }
    }
}

async function main() {
    await runOdoo();
    await runSanity();
}
main();

