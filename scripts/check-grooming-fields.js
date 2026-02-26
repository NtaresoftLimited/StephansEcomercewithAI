const xmlrpc = require("xmlrpc");
require("dotenv").config({ path: ".env" });

const ODOO_URL = "https://erp.stephanspetstore.co.tz";
const ODOO_DB = "Stephans";
const ODOO_USER = "info@stephanspetstore.co.tz";
const ODOO_PASS = "Stephan@3202";

function xmlrpcCall(service, method, args) {
    const client = xmlrpc.createSecureClient({ url: `${ODOO_URL}/xmlrpc/2/${service}` });
    return new Promise((resolve, reject) => {
        client.methodCall(method, args, (err, val) => err ? reject(err) : resolve(val));
    });
}

async function run() {
    const uid = await xmlrpcCall("common", "authenticate", [ODOO_DB, ODOO_USER, ODOO_PASS, {}]);
    const auth = [ODOO_DB, uid, ODOO_PASS];

    // List all services
    try {
        const services = await xmlrpcCall("object", "execute_kw", [...auth, "grooming.service", "search_read", [[]], { fields: ["id", "name", "is_addon"] }]);
        console.log("\n=== EXISTING SERVICES ===");
        console.log(JSON.stringify(services, null, 2));
    } catch (e) {
        console.log("grooming.service error:", e.message);
    }
}

run().catch(console.error);
