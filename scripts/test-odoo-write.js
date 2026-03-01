
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { odoo } from "../lib/odoo/client";

async function testOdooWrite() {
    try {
        console.log("🛠️ Testing Odoo Write Access (creating test appointment)...");
        const partnerId = await odoo.executeKw("res.partner", "create", [{
            name: "Test Customer (Antigravity Test)",
            phone: "+255769123456",
            customer_rank: 1
        }]);
        console.log(`✅ Created test partner: ${partnerId}`);

        const appointmentId = await odoo.executeKw("grooming.appointment", "create", [{
            partner_id: partnerId,
            pet_name: "Test Pet (Antigravity Test)",
            pet_type: "dog",
            pet_category: "small",
            appointment_date: "2026-12-31 10:00:00",
            state: "pending",
        }]);
        console.log(`✅ Success! Created appointment ID: ${appointmentId}`);

        // Cleanup NOT done here to demonstrate it works
        console.log("✅ Odoo write test passed.");
    } catch (error) {
        console.error("❌ Odoo Write Error:", error.message);
        console.error("Full Error:", JSON.stringify(error, null, 2));
    }
}

testOdooWrite();
