
import { pushBookingToOdoo } from "../lib/odoo/grooming-sync";
import dotenv from "dotenv";
import path from "path";

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
    console.log("🚀 Starting Odoo Sync Verification...");

    const dummyBooking = {
        petType: "dog",
        petName: `TestDog_${Math.floor(Math.random() * 1000)}`,
        breedSize: "small",
        package: "standard", // Maps to "Standard Package"
        price: 50000,
        appointmentDate: new Date(Date.now() + 172800000).toISOString(), // 2 Days from now (Monday)
        appointmentTime: "14:00",
        customerName: "Test Sync Script",
        customerEmail: "test.sync@example.com",
        customerPhone: "+255777888999",
        specialNotes: "This is a verification test from the deployment agent",
        detangling: true,
        bookingNumber: `TEST-${Date.now()}`
    };

    console.log("📋 Payload:", dummyBooking);

    try {
        const odooId = await pushBookingToOdoo(dummyBooking);

        if (odooId) {
            console.log(`✅ SUCCESS! Odoo Record ID: ${odooId}`);
        } else {
            console.log("❌ FAILED: No ID returned.");
        }
    } catch (error) {
        console.error("❌ EXCEPTION:", error);
    }
}

main();
