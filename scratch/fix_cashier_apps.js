
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

    // 1. Find all users - look for Cashier users
    const users = await rpc(uid, "res.users", "search_read", [[["active", "=", true]]], { fields: ["name", "login", "groups_id"] });
    console.log("=== All Active Users ===");
    users.forEach(u => console.log(`  [${u.id}] ${u.name} (${u.login}) - ${u.groups_id.length} groups`));

    // 2. Find the Cashier user(s) - likely named "Cashier" or "Stephan" with the S avatar
    const cashiers = users.filter(u => u.name.toLowerCase().includes("cashier") || u.name.toLowerCase().includes("stephan"));
    console.log("\n=== Potential Cashier Users ===");
    cashiers.forEach(u => console.log(`  [${u.id}] ${u.name} (${u.login})`));
    
    // 3. Find the groups related to the apps we want to HIDE
    // We need to find groups for: Discuss, Calendar, Appointments, Knowledge, Contacts, Dashboards, WhatsApp, Inventory, Employees, Approvals, Apps
    const appsToHide = ["mail", "calendar", "appointment", "knowledge", "contacts", "spreadsheet_dashboard", "whatsapp", "stock", "hr", "approvals"];
    
    // Find groups related to these modules
    for (const appName of appsToHide) {
        const groups = await rpc(uid, "ir.module.category", "search_read", [[["name", "ilike", appName]]], { fields: ["name", "xml_id"] });
        if (groups.length > 0) {
            console.log(`\n  Module Category: ${appName}`);
            groups.forEach(g => console.log(`    [${g.id}] ${g.name} (${g.xml_id})`));
        }
    }
}
main().catch(console.error);

