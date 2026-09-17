
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
        
        const modelRes = await fetch(`${ODOO_URL}/jsonrpc`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0", method: "call", params: {
                    service: "object", method: "execute_kw",
                    args: [DB, uid, PASS, "ir.model", "search", [[["model", "=", "res.partner"]]]]
                }, id: 2
            })
        });
        const partnerModelId = (await modelRes.json()).result[0];
        console.log("res.partner model ID:", partnerModelId);
        
        const createRes = await fetch(`${ODOO_URL}/jsonrpc`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0", method: "call", params: {
                    service: "object", method: "execute_kw",
                    args: [DB, uid, PASS, "ir.actions.server", "create", [{
                        name: "Fix DB Column 2",
                        model_id: partnerModelId,
                        state: "code",
                        code: `
env.cr.execute("ALTER TABLE repair_order ADD COLUMN diagnosis_invoice_id integer;")
try:
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
            const runRes = await fetch(`${ODOO_URL}/jsonrpc`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0", method: "call", params: {
                        service: "object", method: "execute_kw",
                        args: [DB, uid, PASS, "ir.actions.server", "run", [[actionId]]]
                    }, id: 4
                })
            });
            console.log("Run Result:", JSON.stringify(await runRes.json(), null, 2));
        }

    } catch (e) { console.error(e); }
}
run();

