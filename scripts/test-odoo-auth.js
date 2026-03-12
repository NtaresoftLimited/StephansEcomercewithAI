
const ODOO_URL = process.env.ODOO_URL || "https://erp.stephanspetstore.co.tz";
const ODOO_DB = process.env.ODOO_DB || "Stephans";
const ODOO_USER = process.env.ODOO_USER || "info@stephanspetstore.co.tz";
const ODOO_PASSWORD = process.env.ODOO_PASSWORD || "Stephan@3202";

async function testOdoo() {
    console.log(`Testing Odoo connection to ${ODOO_URL}...`);
    try {
        const response = await fetch(`${ODOO_URL}/jsonrpc`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "call",
                params: {
                    service: "common",
                    method: "authenticate",
                    args: [ODOO_DB, ODOO_USER, ODOO_PASSWORD, {}]
                },
                id: Date.now()
            })
        });

        console.log(`Status: ${response.status}`);
        const data = await response.json();
        if (data.error) {
            console.error("Odoo Error:", data.error);
        } else {
            console.log("Success! UID:", data.result);
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testOdoo();
