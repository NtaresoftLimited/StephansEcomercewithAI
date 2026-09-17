
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
        
        console.log("Checking repair.order...");
        const res = await fetch(`${ODOO_URL}/jsonrpc`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0", method: "call", params: {
                    service: "object", method: "execute_kw",
                    args: [DB, uid, PASS, "repair.order", "search_read", [[]], { limit: 1 }]
                }, id: 2
            })
        });
        const json = await res.json();
        console.log("Response:", JSON.stringify(json, null, 2));
    } catch (e) { console.error(e); }
}
run();

