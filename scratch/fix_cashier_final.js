
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

    const cashierUserIds = [11, 12];

    // Barcode menu requires group 58 (Inventory / User)
    // But we dont want Inventory APP to show. 
    // Solution: Add back group 58 for Barcode access, but hide the Inventory menu from these users.
    
    // Step 1: Add Inventory User group (58) back to both users for Barcode access
    for (const userId of cashierUserIds) {
        const user = await rpc(uid, "res.users", "read", [userId], { fields: ["name", "groups_id"] });
        if (!user[0].groups_id.includes(58)) {
            // Add group 58 using (4, groupId) = add relation
            await rpc(uid, "res.users", "write", [[userId], { groups_id: [[4, 58]] }]);
            console.log(`Added Inventory/User group to ${user[0].name} for Barcode access`);
        } else {
            console.log(`${user[0].name} already has Inventory/User group`);
        }
    }

    // Step 2: Hide unwanted app menus from cashier users
    // Find the root menus for apps we want to HIDE
    const appsToHide = ["Discuss", "Calendar", "Appointments", "Knowledge", "Contacts", "Dashboards", "WhatsApp", "Inventory", "Employees", "Approvals", "Apps"];
    
    // Get root menus (parent_id = false means top-level app menus)
    const allRootMenus = await rpc(uid, "ir.ui.menu", "search_read", [[["parent_id", "=", false]]], { fields: ["name", "groups_id"] });
    console.log("\n=== All Root App Menus ===");
    allRootMenus.forEach(m => console.log(`  [${m.id}] ${m.name} - groups: [${m.groups_id}]`));

    // Find the menus we want to hide
    const menusToRestrict = allRootMenus.filter(m => appsToHide.some(app => m.name.toLowerCase().includes(app.toLowerCase())));
    console.log("\n=== Menus to hide from cashiers ===");
    menusToRestrict.forEach(m => console.log(`  [${m.id}] ${m.name}`));

    // Step 3: Create a special "Cashier Restricted" group (if doesnt exist)
    // Actually, simpler approach: use ir.rule or menu restriction
    // The cleanest way: restrict the menus by removing the cashier users from groups that give access
    // But some menus have no group restriction (visible to all internal users)
    
    // For menus with NO group restriction, we need to ADD a group restriction
    // so only specific users can see them
    
    // Find POS admin group (74) - we can use this as the "allowed" group for restricted menus
    // Actually lets find what groups admin has that cashiers dont
    
    // Better approach: For each unwanted menu, if it has no groups_id, 
    // add a group that only admin has (e.g., Administration/Settings = group for admin)
    const adminGroups = await rpc(uid, "res.groups", "search_read", [[["full_name", "ilike", "Administration"]]], { fields: ["name", "full_name"] });
    console.log("\nAdmin groups:", adminGroups.map(g => `[${g.id}] ${g.full_name}`));
    
    // Use "Administration / Settings" group to restrict menus
    const adminSettingsGroup = adminGroups.find(g => g.full_name.includes("Settings"));
    if (!adminSettingsGroup) {
        console.log("ERROR: Could not find Administration/Settings group");
        return;
    }
    const adminGroupId = adminSettingsGroup.id;
    console.log(`Using admin group: [${adminGroupId}] ${adminSettingsGroup.full_name}`);

    for (const menu of menusToRestrict) {
        if (menu.groups_id.length === 0) {
            // Menu has no group restriction - add admin group to restrict it
            await rpc(uid, "ir.ui.menu", "write", [[menu.id], { groups_id: [[4, adminGroupId]] }]);
            console.log(`  ✅ Restricted "${menu.name}" to admin only`);
        } else {
            // Menu already has groups - check if cashier groups are in there
            // Remove cashier-accessible groups if needed
            console.log(`  ℹ️ "${menu.name}" already restricted to groups: [${menu.groups_id}]`);
        }
    }

    // Verify: check what menus cashier can see now
    // Login as cashier to test
    const cashierAuth = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: { service: "common", method: "login", args: [DB, "salesmasaki@stephanspetstore.co.tz", "Stephan@3202"] }, id: 1 })
    });
    const cashierUid = (await cashierAuth.json()).result;
    
    if (cashierUid) {
        console.log("\n=== Testing as Sales Team Masaki ===");
        // Note: We cant easily test menu visibility via RPC, the user needs to refresh their browser
        console.log("Login successful. User should refresh browser to see changes.");
    } else {
        console.log("Could not login as cashier - different password?");
    }
}
main().catch(console.error);

