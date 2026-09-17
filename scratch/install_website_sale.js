
const ODOO_URL = "https://erp.stephanspetstore.co.tz";
const DB = "Stephans";
const USER = "info@stephanspetstore.co.tz";
const PASS = "Stephan@3202";

async function runOdoo() {
    console.log("Connecting to Odoo...");
    const authRes = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0", method: "call", params: { service: "common", method: "login", args: [DB, USER, PASS] }, id: 1
        })
    });
    const uid = (await authRes.json()).result;

    // Search for website_sale module
    const modRes = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0", method: "call", params: {
                service: "object", method: "execute_kw",
                args: [DB, uid, PASS, "ir.module.module", "search_read", [[["name", "=", "website_sale"]]], { fields: ["state"] }]
            }, id: 2
        })
    });
    const modules = (await modRes.json()).result;
    
    if (modules && modules.length > 0) {
        const modId = modules[0].id;
        console.log(`website_sale state is: ${modules[0].state}`);
        if (modules[0].state !== "installed") {
            console.log("Installing website_sale...");
            const installRes = await fetch(`${ODOO_URL}/jsonrpc`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0", method: "call", params: {
                        service: "object", method: "execute_kw",
                        args: [DB, uid, PASS, "ir.module.module", "button_immediate_install", [[modId]]]
                    }, id: 3
                })
            });
            console.log("Install Result:", JSON.stringify(await installRes.json()));
        } else {
            console.log("website_sale is already installed.");
        }
    } else {
        console.log("website_sale module not found.");
    }
}
runOdoo();

