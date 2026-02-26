/**
 * Diagnostic script to check if grooming.appointment model exists in Odoo
 * and find what model we should use instead (e.g. calendar.event)
 */
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
    console.log("Authenticating...");
    const uid = await xmlrpcCall("common", "authenticate", [ODOO_DB, ODOO_USER, ODOO_PASS, {}]);
    if (!uid) { console.error("Auth failed"); return; }
    console.log("UID:", uid);
    const auth = [ODOO_DB, uid, ODOO_PASS];

    // Check if grooming.appointment model exists
    console.log("\nChecking grooming.appointment...");
    try {
        const count = await xmlrpcCall("object", "execute_kw", [...auth, "grooming.appointment", "search_count", [[]]]);
        console.log("✅ grooming.appointment EXISTS, record count:", count);

        // Fetch all records to see current state
        const records = await xmlrpcCall("object", "execute_kw", [...auth, "grooming.appointment", "search_read", [[]], { fields: ["id", "partner_id", "pet_name", "appointment_date", "state"], limit: 20 }]);
        console.log("Records:", JSON.stringify(records, null, 2));
    } catch (e) {
        console.log("❌ grooming.appointment does NOT exist:", e.message);
    }

    // Check calendar.event as possible alternative
    console.log("\nChecking calendar.event...");
    try {
        const count = await xmlrpcCall("object", "execute_kw", [...auth, "calendar.event", "search_count", [[]]]);
        console.log("✅ calendar.event EXISTS, record count:", count);
    } catch (e) {
        console.log("❌ calendar.event issue:", e.message);
    }

    // Check if there are any grooming-related models
    console.log("\nSearching for grooming-related models...");
    try {
        const models = await xmlrpcCall("object", "execute_kw", [...auth, "ir.model", "search_read", [[["model", "like", "grooml"]]], { fields: ["name", "model"] }]);
        console.log("Grooming models:", models);
    } catch (e) {
        console.log("Error:", e.message);
    }

    // Check for appointment-related models
    console.log("\nSearching for appointment-related models...");
    try {
        const models = await xmlrpcCall("object", "execute_kw", [...auth, "ir.model", "search_read", [[["model", "like", "appointment"]]], { fields: ["name", "model"] }]);
        console.log("Appointment models:", models);
    } catch (e) {
        console.log("Error:", e.message);
    }
}

run().catch(console.error);
