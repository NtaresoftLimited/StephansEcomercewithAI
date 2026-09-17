
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

    // Get POS configs with correct fields
    const posConfigs = await rpc(uid, "pos.config", "search_read", [[]], { fields: ["name", "basic_employee_ids", "advanced_employee_ids", "x_allowed_users"] });
    console.log("=== POS Configurations ===");
    for (const pc of posConfigs) {
        console.log(`\n  [${pc.id}] ${pc.name}`);
        console.log(`    x_allowed_users: [${pc.x_allowed_users}]`);
        console.log(`    basic_employee_ids: [${pc.basic_employee_ids}]`);
        console.log(`    advanced_employee_ids: [${pc.advanced_employee_ids}]`);
        
        if (pc.x_allowed_users?.length > 0) {
            const users = await rpc(uid, "res.users", "read", [pc.x_allowed_users], { fields: ["name"] });
            console.log(`    Allowed users: ${users.map(u => u.name).join(", ")}`);
        }
        if (pc.basic_employee_ids?.length > 0) {
            const emps = await rpc(uid, "hr.employee", "read", [pc.basic_employee_ids], { fields: ["name"] });
            console.log(`    Basic employees: ${emps.map(e => e.name).join(", ")}`);
        }
        if (pc.advanced_employee_ids?.length > 0) {
            const emps = await rpc(uid, "hr.employee", "read", [pc.advanced_employee_ids], { fields: ["name"] });
            console.log(`    Advanced employees: ${emps.map(e => e.name).join(", ")}`);
        }
    }

    // Check record rules
    const rules = await rpc(uid, "ir.rule", "search_read", [[["model_id.model", "in", ["pos.order", "pos.session", "pos.config"]]]], { fields: ["name", "domain_force", "groups", "perm_read", "model_id"] });
    console.log("\n=== POS Record Rules ===");
    rules.forEach(r => console.log(`  [${r.id}] ${r.name} | model: ${r.model_id[1]} | domain: ${r.domain_force} | groups: [${r.groups}]`));

    // Check POS order - how many orders each POS has
    for (const pc of posConfigs) {
        const count = await rpc(uid, "pos.order", "search_count", [[["config_id", "=", pc.id]]]);
        console.log(`\n  ${pc.name}: ${count} total orders`);
    }
}
main().catch(console.error);

