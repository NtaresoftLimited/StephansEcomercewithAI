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

    let partnerId;
    const existing = await xmlrpcCall("object", "execute_kw", [...auth, "res.partner", "search_read", [[["email", "=", "test@test.local"]]], { limit: 1 }]);
    if (existing.length) partnerId = existing[0].id;
    else partnerId = await xmlrpcCall("object", "execute_kw", [...auth, "res.partner", "create", [{ name: "Test Auto", email: "test@test.local" }]]);

    console.log("Partner ID", partnerId);

    // Try creating an appointment directly
    const payload = {
        partner_id: partnerId,
        pet_name: "Test Dog",
        pet_type: "dog",
        pet_category: "small",
        service_type: "full_grooming",
        service_id: 1, // Standard Package
        appointment_date: "2026-03-02 10:00:00",
        preferred_time: "10:00",
        has_detangling: false,
        state: "pending",
    };

    try {
        const id = await xmlrpcCall("object", "execute_kw", [...auth, "grooming.appointment", "create", [payload]]);
        console.log("SUCCESS! Created appointment:", id);
    } catch (e) {
        console.log("FAILED to create appointment:", e.message);
    }
}

run().catch(console.error);
