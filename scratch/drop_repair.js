
const ODOO_URL = "https://erp.stephanspetstore.co.tz";
const DB = "Stephans";
const USER = "info@stephanspetstore.co.tz";
const PASS = "Stephan@3202";

async function run() {
    try {
        const authRes = await fetch(`${ODOO_URL}/jsonrpc`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0", method: "call", params: { service: "common", method: "login", args: [DB, USER, PASS] }, id: 1
            })
        });
        const uid = (await authRes.json()).result;
        
        console.log("Creating action to drop table...");
        const createRes = await fetch(`${ODOO_URL}/jsonrpc`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0", method: "call", params: {
                    service: "object", method: "execute_kw",
                    args: [DB, uid, PASS, "ir.actions.server", "create", [{
                        name: "Drop Repair Order",
                        model_id: 87, // res.partner
                        state: "code",
                        code: `
try:
    env.cr.execute("DROP TABLE IF EXISTS repair_order CASCADE;")
    env.cr.commit()
except Exception:
    pass
`
                    }]]
                }, id: 3
            })
        });
        const actionId = (await createRes.json()).result;
        console.log("Created action ID:", actionId);
        
        if (actionId) {
            console.log("Running server action...");
            await fetch(`${ODOO_URL}/jsonrpc`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0", method: "call", params: {
                        service: "object", method: "execute_kw",
                        args: [DB, uid, PASS, "ir.actions.server", "run", [[actionId]]]
                    }, id: 4
                })
            });
            console.log("Table dropped.");
        }
    } catch (e) { console.error(e); }
}
run();

