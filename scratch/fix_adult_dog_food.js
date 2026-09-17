
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

    // Get Adult Dog Food category ID (1200 according to earlier checks, but lets search)
    let res = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0", method: "call", params: {
                service: "object", method: "execute_kw",
                args: [DB, uid, PASS, "product.category", "search_read", [[["name", "=", "Adult Dog Food"]]], { fields: ["name", "parent_id"] }]
            }, id: 2
        })
    });
    const categories = (await res.json()).result;
    const catId = categories[0].id;
    
    // Get Bowls category ID (for moving non-food items)
    res = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0", method: "call", params: {
                service: "object", method: "execute_kw",
                args: [DB, uid, PASS, "product.category", "search_read", [[["name", "=", "Food Bowls"]]], { fields: ["name", "parent_id"] }]
            }, id: 2
        })
    });
    const bowlCategories = (await res.json()).result;
    const bowlCatId = bowlCategories.length > 0 ? bowlCategories[0].id : catId; // fallback
    
    // Get products in Adult Dog Food
    res = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0", method: "call", params: {
                service: "object", method: "execute_kw",
                args: [DB, uid, PASS, "product.template", "search_read", [[["categ_id", "child_of", catId], ["active", "=", true]]], { fields: ["name", "categ_id"] }]
            }, id: 3
        })
    });
    const products = (await res.json()).result;
    
    const toMove = [];
    const keep = [];
    
    for (const p of products) {
        const name = p.name.toLowerCase();
        // Identify non-food items based on keywords
        if (name.includes("mat") || name.includes("bottle") || name.includes("dispenser") || name.includes("silcon")) {
            toMove.push(p);
        } else {
            keep.push(p.name);
        }
    }
    
    if (toMove.length > 0 && bowlCatId !== catId) {
        console.log(`Moving ${toMove.length} items to Food Bowls (ID: ${bowlCatId})...`);
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
    
    console.log("\nRemaining Adult Dog Food Products:");
    keep.forEach(k => console.log(`- ${k}`));
    
    return { keep, moved: toMove.map(p => p.name) };
}
runOdoo();

