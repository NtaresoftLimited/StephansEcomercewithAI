
const ODOO_URL = "https://erp.stephanspetstore.co.tz";
const DB = "Stephans";
const USER = "info@stephanspetstore.co.tz";
const PASS = "Stephan@3202";

async function run() {
    try {
        console.log("Authenticating...");
        const authRes = await fetch(`${ODOO_URL}/jsonrpc`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "call",
                params: {
                    service: "common",
                    method: "login",
                    args: [DB, USER, PASS]
                },
                id: 1
            })
        });
        const authData = await authRes.json();
        if (authData.error) throw new Error(JSON.stringify(authData.error));
        const uid = authData.result;
        if (!uid) throw new Error("Authentication failed");
        
        console.log(`Authenticated with uid: ${uid}`);
        
        // Check ir.logging for recent errors
        console.log("Fetching recent errors from ir.logging...");
        const logRes = await fetch(`${ODOO_URL}/jsonrpc`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "call",
                params: {
                    service: "object",
                    method: "execute_kw",
                    args: [
                        DB, uid, PASS,
                        "ir.logging",
                        "search_read",
                        [[["level", "in", ["ERROR", "WARNING", "CRITICAL"]]]],
                        { 
                            fields: ["create_date", "name", "level", "message", "func", "path", "line"], 
                            limit: 5,
                            order: "create_date desc"
                        }
                    ]
                },
                id: 2
            })
        });
        const logData = await logRes.json();
        if (logData.error) {
            console.log("Could not read ir.logging (access denied or error). Error:", logData.error.data.message);
        } else {
            console.log("Recent Logs:");
            console.log(JSON.stringify(logData.result, null, 2));
        }

    } catch (e) {
        console.error("Error:", e);
    }
}
run();

