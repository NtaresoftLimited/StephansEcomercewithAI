
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

    const adminGroupId = 4; // Administration / Settings
    
    // Menus to restrict: replace their groups with admin-only
    // These currently have group [1] (Internal User) which all users have
    const menusToFix = [
        { id: 77, name: "Discuss" },
        { id: 224, name: "Calendar" },
        { id: 261, name: "Appointments" },
        { id: 232, name: "Contacts" },
        { id: 637, name: "Employees" },
        { id: 1611, name: "Website" },
        { id: 1485, name: "Social Marketing" },
        { id: 484, name: "Sales" },
    ];
    
    for (const menu of menusToFix) {
        // Replace groups with admin-only: (6, 0, [adminGroupId]) = set to only admin
        await rpc(uid, "ir.ui.menu", "write", [[menu.id], { groups_id: [[6, 0, [adminGroupId]]] }]);
        console.log(`✅ Restricted "${menu.name}" (menu ${menu.id}) to admin only`);
    }

    // Also need to handle Inventory menu (381) - it currently requires groups [59, 58]
    // Cashier has group 58 (for Barcode). We need Inventory menu to require group 59 (Admin) only
    await rpc(uid, "ir.ui.menu", "write", [[381], { groups_id: [[6, 0, [59]]] }]);
    console.log("✅ Restricted Inventory menu to Inventory Admin (59) only");
    
    // Remove Inventory Admin (59) from cashiers if they have it
    for (const userId of [11, 12]) {
        const user = await rpc(uid, "res.users", "read", [userId], { fields: ["name", "groups_id"] });
        if (user[0].groups_id.includes(59)) {
            await rpc(uid, "res.users", "write", [[userId], { groups_id: [[3, 59]] }]); // (3, id) = remove
            console.log(`  Removed Inventory Admin from ${user[0].name}`);
        }
    }

    // Verify: Check final root menus and their groups
    const finalMenus = await rpc(uid, "ir.ui.menu", "search_read", [[["parent_id", "=", false]]], { fields: ["name", "groups_id"] });
    console.log("\n=== Final Root Menu Configuration ===");
    finalMenus.forEach(m => console.log(`  [${m.id}] ${m.name} - groups: [${m.groups_id}]`));
    
    // Check what groups cashiers have
    for (const userId of [11, 12]) {
        const user = await rpc(uid, "res.users", "read", [userId], { fields: ["name", "groups_id"] });
        console.log(`\n${user[0].name} groups: [${user[0].groups_id}]`);
        
        // Check which root menus this user can see
        const visibleMenus = finalMenus.filter(m => {
            if (m.groups_id.length === 0) return true; // no restriction
            return m.groups_id.some(gId => user[0].groups_id.includes(gId));
        });
        console.log(`  Visible apps: ${visibleMenus.map(m => m.name).join(", ")}`);
    }
}
main().catch(console.error);

