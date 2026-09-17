
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

    // 1. Check POS configs (shops/locations)
    const posConfigs = await rpc(uid, "pos.config", "search_read", [[]], { fields: ["name", "allowed_user_ids", "group_pos_user_id"] });
    console.log("=== POS Configurations ===");
    posConfigs.forEach(p => console.log(`  [${p.id}] ${p.name} - allowed_users: [${p.allowed_user_ids}]`));

    // 2. Check POS sessions
    const sessions = await rpc(uid, "pos.session", "search_read", [[["state", "!=", "closed"]]], { fields: ["name", "config_id", "user_id", "state"] });
    console.log("\n=== Active POS Sessions ===");
    sessions.forEach(s => console.log(`  [${s.id}] ${s.name} - config: ${s.config_id[1]} - user: ${s.user_id[1]} - state: ${s.state}`));

    // 3. Check record rules for pos.order
    const rules = await rpc(uid, "ir.rule", "search_read", [[["model_id.model", "=", "pos.order"]]], { fields: ["name", "domain_force", "groups", "perm_read"] });
    console.log("\n=== POS Order Record Rules ===");
    rules.forEach(r => console.log(`  [${r.id}] ${r.name} - domain: ${r.domain_force} - groups: [${r.groups}]`));

    // 4. Check what Sales groups the cashiers had before (we removed group 80)
    // Group 80 = Sales / User: Own Documents Only - this restricts to own documents
    const cashierUserIds = [11, 12];
    for (const userId of cashierUserIds) {
        const user = await rpc(uid, "res.users", "read", [userId], { fields: ["name", "groups_id", "pos_config_ids"] });
        console.log(`\n${user[0].name}: groups has 80 (Sales Own Docs)? ${user[0].groups_id.includes(80)}`);
        console.log(`  POS config IDs: ${user[0].pos_config_ids || "none"}`);
    }
    
    // 5. Check if POS configs have user restrictions
    console.log("\n=== POS Config Details ===");
    for (const pc of posConfigs) {
        const detail = await rpc(uid, "pos.config", "read", [pc.id], { fields: ["name", "allowed_user_ids", "module_pos_restaurant"] });
        console.log(`  [${detail[0].id}] ${detail[0].name}`);
        console.log(`    allowed_user_ids: [${detail[0].allowed_user_ids}]`);
        
        if (detail[0].allowed_user_ids.length > 0) {
            const users = await rpc(uid, "res.users", "read", [detail[0].allowed_user_ids], { fields: ["name"] });
            console.log(`    allowed users: ${users.map(u => u.name).join(", ")}`);
        } else {
            console.log(`    allowed users: ALL (no restriction)`);
        }
    }
}
main().catch(console.error);

