
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

    const catRes = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0", method: "call", params: {
                service: "object", method: "execute_kw",
                args: [DB, uid, PASS, "product.category", "search_read", [[["name", "=", "Adult Dog Food"]]], { fields: ["id"] }]
            }, id: 2
        })
    });
    const catId = (await catRes.json()).result[0].id;
    
    const bowlRes = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0", method: "call", params: {
                service: "object", method: "execute_kw",
                args: [DB, uid, PASS, "product.category", "search_read", [[["name", "=", "Food Bowls"]]], { fields: ["id"] }]
            }, id: 2
        })
    });
    const bowlCatId = (await bowlRes.json()).result[0].id;
    
    const prodRes = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0", method: "call", params: {
                service: "object", method: "execute_kw",
                args: [DB, uid, PASS, "product.template", "search_read", [[["categ_id", "child_of", catId], ["active", "=", true]]], { fields: ["name", "categ_id"] }]
            }, id: 3
        })
    });
    const products = (await prodRes.json()).result;
    
    const toMove = [];
    const keep = [];
    
    for (const p of products) {
        const name = p.name.toLowerCase();
        if (name.includes("spoon") || name.includes("cup") || name.includes("container") || name.includes("storage")) {
            toMove.push(p);
        } else {
            keep.push(p.name);
        }
    }
    
    if (toMove.length > 0) {
        console.log(`Moving ${toMove.length} items to Food Bowls...`);
        const toMoveIds = toMove.map(p => p.id);
        const updateRes = await fetch(`${ODOO_URL}/jsonrpc`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0", method: "call", params: {
                    service: "object", method: "execute_kw",
                    args: [DB, uid, PASS, "product.template", "write", [toMoveIds, { categ_id: bowlCatId }]]
                }, id: 4
            })
        });
        console.log("Move result:", JSON.stringify(await updateRes.json()));
    }
    
    console.log("\nFINAL Adult Dog Food Products:");
    keep.forEach(k => console.log(`- ${k}`));
}
runOdoo();

