
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
    const cashierUserIds = [11, 12];

    // Remove CRM groups (80, 82) and Accounting group (23) from cashiers
    const groupsToRemove = [80, 82, 23]; // Sales/CRM, Accounting/Invoicing
    
    for (const userId of cashierUserIds) {
        const user = await rpc(uid, "res.users", "read", [userId], { fields: ["name", "groups_id"] });
        for (const gId of groupsToRemove) {
            if (user[0].groups_id.includes(gId)) {
                await rpc(uid, "res.users", "write", [[userId], { groups_id: [[3, gId]] }]);
                console.log(`Removed group ${gId} from ${user[0].name}`);
            }
        }
    }

    // Verify final state
    const finalMenus = await rpc(uid, "ir.ui.menu", "search_read", [[["parent_id", "=", false]]], { fields: ["name", "groups_id"] });
    
    for (const userId of cashierUserIds) {
        const user = await rpc(uid, "res.users", "read", [userId], { fields: ["name", "groups_id"] });
        const visibleMenus = finalMenus.filter(m => {
            if (m.groups_id.length === 0) return true;
            return m.groups_id.some(gId => user[0].groups_id.includes(gId));
        });
        console.log(`\n${user[0].name} visible apps: ${visibleMenus.map(m => m.name).join(", ")}`);
    }
}
main().catch(console.error);

