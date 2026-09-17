
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
        
        console.log("Creating server action to alter table...");
        const code = `
try:
    env.cr.execute("ALTER TABLE repair_order ADD COLUMN diagnosis_invoice_id integer;")
    env.cr.commit()
except Exception as e:
    pass
try:
    env.cr.execute("ALTER TABLE repair_order ADD COLUMN is_diagnosis_invoiced boolean;")
    env.cr.commit()
except Exception as e:
    pass
        `;
        
        const createRes = await fetch(`${ODOO_URL}/jsonrpc`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0", method: "call", params: {
                    service: "object", method: "execute_kw",
                    args: [DB, uid, PASS, "ir.actions.server", "create", [{
                        name: "Fix DB Column",
                        model_id: 1, // res.partner usually works as a dummy
                        state: "code",
                        code: code
                    }]]
                }, id: 2
            })
        });
        const actionId = (await createRes.json()).result;
        console.log("Created action ID:", actionId);
        
        if (actionId) {
            console.log("Running server action...");
            const runRes = await fetch(`${ODOO_URL}/jsonrpc`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0", method: "call", params: {
                        service: "object", method: "execute_kw",
                        args: [DB, uid, PASS, "ir.actions.server", "run", [[actionId]]]
                    }, id: 3
                })
            });
            console.log("Run Result:", JSON.stringify(await runRes.json(), null, 2));
        }

    } catch (e) { console.error(e); }
}
run();

