
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

    // 1. Get POS config fields first
    const fields = await rpc(uid, "pos.config", "fields_get", [], { attributes: ["string", "type"] });
    const relevantFields = Object.entries(fields).filter(([k, v]) => 
        k.includes("user") || k.includes("employee") || k.includes("restrict") || k.includes("allow")
    );
    console.log("=== Relevant POS Config Fields ===");
    relevantFields.forEach(([k, v]) => console.log(`  ${k}: ${v.string} (${v.type})`));

    // 2. Get POS configs
    const posConfigs = await rpc(uid, "pos.config", "search_read", [[]], { fields: ["name", "employee_ids", "basic_employee_ids"] });
    console.log("\n=== POS Configurations ===");
    posConfigs.forEach(p => {
        console.log(`  [${p.id}] ${p.name}`);
        console.log(`    employee_ids: [${p.employee_ids}]`);
        console.log(`    basic_employee_ids: [${p.basic_employee_ids}]`);
    });

    // 3. Check record rules for pos.order
    const rules = await rpc(uid, "ir.rule", "search_read", [[["model_id.model", "=", "pos.order"]]], { fields: ["name", "domain_force", "groups", "perm_read"] });
    console.log("\n=== POS Order Record Rules ===");
    rules.forEach(r => console.log(`  [${r.id}] ${r.name} - domain: ${r.domain_force} - groups: [${r.groups}] - read: ${r.perm_read}`));

    // 4. Check record rules for pos.session
    const sessionRules = await rpc(uid, "ir.rule", "search_read", [[["model_id.model", "=", "pos.session"]]], { fields: ["name", "domain_force", "groups", "perm_read"] });
    console.log("\n=== POS Session Record Rules ===");
    sessionRules.forEach(r => console.log(`  [${r.id}] ${r.name} - domain: ${r.domain_force} - groups: [${r.groups}] - read: ${r.perm_read}`));

    // 5. Get employees linked to cashier users
    const employees = await rpc(uid, "hr.employee", "search_read", [[["user_id", "in", [11, 12]]]], { fields: ["name", "user_id"] });
    console.log("\n=== Cashier Employees ===");
    employees.forEach(e => console.log(`  [${e.id}] ${e.name} - user: ${e.user_id[1]}`));

    // 6. Check POS config with all fields
    for (const pc of posConfigs) {
        const detail = await rpc(uid, "pos.config", "read", [pc.id], { fields: ["name", "employee_ids", "basic_employee_ids", "limit_categories", "iface_available_categ_ids"] });
        console.log(`\n  POS: ${detail[0].name}`);
        if (detail[0].employee_ids?.length > 0) {
            const emps = await rpc(uid, "hr.employee", "read", [detail[0].employee_ids], { fields: ["name"] });
            console.log(`    Employees (advanced): ${emps.map(e => e.name).join(", ")}`);
        }
        if (detail[0].basic_employee_ids?.length > 0) {
            const emps = await rpc(uid, "hr.employee", "read", [detail[0].basic_employee_ids], { fields: ["name"] });
            console.log(`    Employees (basic): ${emps.map(e => e.name).join(", ")}`);
        }
    }
}
main().catch(console.error);

