
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

    // Get employee IDs for cashier users
    const employees = await rpc(uid, "hr.employee", "search_read", [[["user_id", "in", [11, 12]]]], { fields: ["name", "user_id"] });
    console.log("=== Cashier Employees ===");
    employees.forEach(e => console.log(`  [${e.id}] ${e.name} - user_id: ${e.user_id[1]} (${e.user_id[0]})`));

    // Mikocheni POS (ID: 7) has Sales Team Mikocheni as advanced_employee (manager)
    // This needs to be moved to basic_employee instead
    
    const mikocheniEmp = employees.find(e => e.user_id[0] === 12);
    if (mikocheniEmp) {
        console.log(`\nMoving ${mikocheniEmp.name} from advanced to basic employee on Mikocheni POS...`);
        // Remove from advanced_employee_ids
        await rpc(uid, "pos.config", "write", [[7], { 
            advanced_employee_ids: [[3, mikocheniEmp.id]],  // remove
            basic_employee_ids: [[4, mikocheniEmp.id]]      // add
        }]);
        console.log("✅ Done!");
    }

    // Verify both POS configs
    const posConfigs = await rpc(uid, "pos.config", "search_read", [[]], { fields: ["name", "basic_employee_ids", "advanced_employee_ids"] });
    for (const pc of posConfigs) {
        console.log(`\n  [${pc.id}] ${pc.name}`);
        if (pc.basic_employee_ids?.length > 0) {
            const emps = await rpc(uid, "hr.employee", "read", [pc.basic_employee_ids], { fields: ["name"] });
            console.log(`    Basic employees: ${emps.map(e => e.name).join(", ")}`);
        } else {
            console.log(`    Basic employees: none`);
        }
        if (pc.advanced_employee_ids?.length > 0) {
            const emps = await rpc(uid, "hr.employee", "read", [pc.advanced_employee_ids], { fields: ["name"] });
            console.log(`    Advanced employees: ${emps.map(e => e.name).join(", ")}`);
        } else {
            console.log(`    Advanced employees: none`);
        }
    }

    // Verify the cashier users DO NOT have group 74 (POS Admin)
    for (const userId of [11, 12]) {
        const user = await rpc(uid, "res.users", "read", [userId], { fields: ["name", "groups_id"] });
        console.log(`\n${user[0].name}: has POS Admin (74)? ${user[0].groups_id.includes(74)} | has POS User (73)? ${user[0].groups_id.includes(73)}`);
    }
}
main().catch(console.error);

