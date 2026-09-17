
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

    // Groups to remove:
    // 20 = Extra Rights / Product Creation  -> controls "New" product button
    // 74 = Point of Sale / Administrator    -> gives admin rights in POS (Masaki has this)
    // 9  = Extra Rights / Contact Creation  -> not needed for cashier
    
    const groupsToRemove = [20, 74, 9];
    
    for (const userId of cashierUserIds) {
        const user = await rpc(uid, "res.users", "read", [userId], { fields: ["name", "groups_id"] });
        console.log(`\n=== ${user[0].name} ===`);
        
        for (const gId of groupsToRemove) {
            if (user[0].groups_id.includes(gId)) {
                await rpc(uid, "res.users", "write", [[userId], { groups_id: [[3, gId]] }]);
                console.log(`  Removed group ${gId}`);
            }
        }
    }

    // Verify final groups
    for (const userId of cashierUserIds) {
        const user = await rpc(uid, "res.users", "read", [userId], { fields: ["name", "groups_id"] });
        const groups = await rpc(uid, "res.groups", "read", [user[0].groups_id], { fields: ["full_name"] });
        console.log(`\n=== ${user[0].name} - Final Groups ===`);
        groups.forEach(g => console.log(`  ${g.full_name}`));
    }
}
main().catch(console.error);

