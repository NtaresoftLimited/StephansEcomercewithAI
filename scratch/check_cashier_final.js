
const ODOO_URL = "https://erp.stephanspetstore.co.tz";
const DB = "Stephans";
const USER = "info@stephanspetstore.co.tz";
const PASS = "Stephan@3202";

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
    if (data.error) throw new Error(JSON.stringify(data.error.data?.message || data.error));
    return data.result;
}

async function main() {
    const authRes = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: { service: "common", method: "login", args: [DB, USER, PASS] }, id: 1 })
    });
    const uid = (await authRes.json()).result;

    // Find Barcode groups by searching ir.module.module
    const barcodeModule = await rpc(uid, "ir.module.module", "search_read", [[["name", "=", "stock_barcode"]]], { fields: ["state"] });
    console.log("Barcode module:", barcodeModule);
    
    // Search for all groups with "barcode" in name
    const barcodeGrps = await rpc(uid, "res.groups", "search_read", [[["full_name", "ilike", "barcode"]]], { fields: ["name", "full_name", "category_id"] });
    console.log("Barcode-related groups:", barcodeGrps.map(g => `[${g.id}] ${g.full_name}`));
    
    // Search for grooming groups 
    const groomGrps = await rpc(uid, "res.groups", "search_read", [[["full_name", "ilike", "groom"]]], { fields: ["name", "full_name"] });
    console.log("Grooming groups:", groomGrps.map(g => `[${g.id}] ${g.full_name}`));
    
    // Check the grooming module
    const groomModule = await rpc(uid, "ir.module.module", "search_read", [[["name", "ilike", "groom"]]], { fields: ["name", "state"] });
    console.log("Grooming modules:", groomModule);
    
    // Look at ir.ui.menu to see what menus require what groups for Grooming and Barcode
    const groomMenus = await rpc(uid, "ir.ui.menu", "search_read", [[["name", "ilike", "Groom"]]], { fields: ["name", "groups_id", "parent_id"] });
    console.log("\nGrooming menus:");
    groomMenus.forEach(m => console.log(`  [${m.id}] ${m.name} - groups: ${m.groups_id}`));
    
    const barcodeMenus = await rpc(uid, "ir.ui.menu", "search_read", [[["name", "ilike", "Barcode"]]], { fields: ["name", "groups_id", "parent_id"] });
    console.log("\nBarcode menus:");
    barcodeMenus.forEach(m => console.log(`  [${m.id}] ${m.name} - groups: ${m.groups_id}`));

    // Check Inventory group - Barcode app usually requires stock.group_stock_user
    const stockGroups = await rpc(uid, "res.groups", "search_read", [[["category_id.name", "=", "Inventory"]]], { fields: ["name", "full_name", "xml_id"] });
    console.log("\nInventory groups:");
    stockGroups.forEach(g => console.log(`  [${g.id}] ${g.full_name} (${g.xml_id})`));
    
    // Check Sales Team Masaki current Inventory access
    const masaki = await rpc(uid, "res.users", "read", [11], { fields: ["name", "groups_id"] });
    const masakiHasInventory = masaki[0].groups_id.includes(58);
    const masakiHasInvAdmin = masaki[0].groups_id.includes(59);
    console.log(`\nMasaki has Inventory User (58): ${masakiHasInventory}`);
    console.log(`Masaki has Inventory Admin (59): ${masakiHasInvAdmin}`);
    
    const mikocheni = await rpc(uid, "res.users", "read", [12], { fields: ["name", "groups_id"] });
    const mikoHasInventory = mikocheni[0].groups_id.includes(58);
    console.log(`Mikocheni has Inventory User (58): ${mikoHasInventory}`);
}
main().catch(console.error);

