
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
        
        console.log("Searching for techovers modules...");
        const res = await fetch(`${ODOO_URL}/jsonrpc`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0", method: "call", params: {
                    service: "object", method: "execute_kw",
                    args: [DB, uid, PASS, "ir.module.module", "search_read", [[["name", "ilike", "techovers"]]], { fields: ["name", "state"] }]
                }, id: 2
            })
        });
        const modules = (await res.json()).result;
        console.log("Modules found:", JSON.stringify(modules, null, 2));

        const installedModules = modules.filter(m => m.state === "installed" || m.state === "to upgrade" || m.state === "to install");
        if (installedModules.length > 0) {
            const moduleIds = installedModules.map(m => m.id);
            console.log("Uninstalling modules with IDs:", moduleIds);
            const uninstallRes = await fetch(`${ODOO_URL}/jsonrpc`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0", method: "call", params: {
                        service: "object", method: "execute_kw",
                        args: [DB, uid, PASS, "ir.module.module", "button_immediate_uninstall", [moduleIds]]
                    }, id: 3
                })
            });
            console.log("Uninstall Response:", JSON.stringify(await uninstallRes.json(), null, 2));
        } else {
            console.log("No installed techovers modules found.");
        }

    } catch (e) { console.error(e); }
}
run();

