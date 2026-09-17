
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

    // Users to restrict: Sales Team Masaki (11), Sales Team Mikocheni (12)
    const cashierUserIds = [11, 12];

    // Groups to REMOVE (these cause the extra apps to appear):
    // Appointment: 37 (makes Appointments/Calendar visible)
    // Inventory: 58, 59 (makes Inventory visible)
    // Purchase: 150 (makes Purchase visible) 
    // Quality: 237 (makes Quality visible)
    // Sales: 80, 81, 82 (makes Sales visible - but might be needed for POS)
    // Surveys: 35 (makes Surveys visible)
    // Accounting: 23 (makes Accounting visible)
    // Website: 265, 266 (makes Website visible)
    
    // Apps to HIDE: Discuss, Calendar, Appointments, Knowledge, Contacts, Dashboards, WhatsApp, Inventory, Employees, Approvals, Apps
    // Groups to REMOVE for these apps:
    const groupsToRemove = [
        37,   // Appointment / User
        59,   // Inventory / Administrator  
        58,   // Inventory / User
        150,  // Purchase / User
        237,  // Quality / User
        35,   // Surveys / User
        265,  // Website / Restricted Editor
        266,  // Website / Editor and Designer
    ];

    // Find Barcode group
    const barcodeGroups = await rpc(uid, "res.groups", "search_read", [[["category_id.name", "ilike", "barcode"]]], { fields: ["name", "full_name"] });
    console.log("Barcode groups:", barcodeGroups.map(g => `[${g.id}] ${g.full_name}`));
    
    // Find Grooming-related groups
    const groomingGroups = await rpc(uid, "res.groups", "search_read", [[["full_name", "ilike", "groom"]]], { fields: ["name", "full_name"] });
    console.log("Grooming groups:", groomingGroups.map(g => `[${g.id}] ${g.full_name}`));
    
    // Also find what gives Discuss, Contacts, Knowledge, Dashboards, Employees, Approvals visibility
    const discussGroups = await rpc(uid, "res.groups", "search_read", [[["category_id.name", "ilike", "discuss"]]], { fields: ["name", "full_name"] });
    console.log("Discuss groups:", discussGroups.map(g => `[${g.id}] ${g.full_name}`));
    
    const knowledgeGroups = await rpc(uid, "res.groups", "search_read", [[["category_id.name", "=", "Knowledge"]]], { fields: ["name", "full_name"] });
    console.log("Knowledge groups:", knowledgeGroups.map(g => `[${g.id}] ${g.full_name}`));
    
    const dashboardGroups = await rpc(uid, "res.groups", "search_read", [[["full_name", "ilike", "dashboard"]]], { fields: ["name", "full_name"] });
    console.log("Dashboard groups:", dashboardGroups.map(g => `[${g.id}] ${g.full_name}`));
    
    const employeeGroups = await rpc(uid, "res.groups", "search_read", [[["category_id.name", "=", "Employees"]]], { fields: ["name", "full_name"] });
    console.log("Employee groups:", employeeGroups.map(g => `[${g.id}] ${g.full_name}`));
    
    const approvalGroups = await rpc(uid, "res.groups", "search_read", [[["category_id.name", "=", "Approvals"]]], { fields: ["name", "full_name"] });
    console.log("Approval groups:", approvalGroups.map(g => `[${g.id}] ${g.full_name}`));
    
    const whatsappGroups = await rpc(uid, "res.groups", "search_read", [[["category_id.name", "ilike", "WhatsApp"]]], { fields: ["name", "full_name"] });
    console.log("WhatsApp groups:", whatsappGroups.map(g => `[${g.id}] ${g.full_name}`));
    
    const contactGroups = await rpc(uid, "res.groups", "search_read", [[["category_id.name", "ilike", "Contacts"]]], { fields: ["name", "full_name"] });
    console.log("Contacts groups:", contactGroups.map(g => `[${g.id}] ${g.full_name}`));
    
    const calendarGroups = await rpc(uid, "res.groups", "search_read", [[["category_id.name", "=", "Calendar"]]], { fields: ["name", "full_name"] });
    console.log("Calendar groups:", calendarGroups.map(g => `[${g.id}] ${g.full_name}`));

    // Collect ALL group IDs to remove
    const allToRemove = new Set(groupsToRemove);
    [...knowledgeGroups, ...dashboardGroups, ...employeeGroups, ...approvalGroups, ...whatsappGroups, ...contactGroups, ...calendarGroups].forEach(g => allToRemove.add(g.id));
    
    console.log("\nGroups to remove:", [...allToRemove]);

    for (const userId of cashierUserIds) {
        const user = await rpc(uid, "res.users", "read", [userId], { fields: ["name", "groups_id"] });
        const currentGroups = user[0].groups_id;
        const newGroups = currentGroups.filter(gId => !allToRemove.has(gId));
        
        console.log(`\n${user[0].name}: ${currentGroups.length} groups → ${newGroups.length} groups`);
        console.log(`  Removing: ${currentGroups.filter(gId => allToRemove.has(gId))}`);
        
        // Use write with (6, 0, newGroups) to replace all groups
        await rpc(uid, "res.users", "write", [[userId], { groups_id: [[6, 0, newGroups]] }]);
        console.log(`  ✅ Updated!`);
    }
    
    // Verify
    for (const userId of cashierUserIds) {
        const user = await rpc(uid, "res.users", "read", [userId], { fields: ["name", "groups_id"] });
        const groups = await rpc(uid, "res.groups", "read", [user[0].groups_id], { fields: ["full_name", "category_id"] });
        console.log(`\n=== ${user[0].name} FINAL groups ===`);
        const byCategory = {};
        groups.forEach(g => {
            const cat = g.category_id ? g.category_id[1] : "Uncategorized";
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(g.full_name);
        });
        Object.keys(byCategory).sort().forEach(cat => {
            console.log(`  ${cat}:`);
            byCategory[cat].forEach(n => console.log(`    ${n}`));
        });
    }
}
main().catch(console.error);

