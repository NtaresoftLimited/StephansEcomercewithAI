
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { createClient } from "@sanity/client";

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2025-12-05',
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
});

async function testSanityWrite() {
    try {
        console.log("🛠️ Testing Sanity Write Access...");
        const result = await client.create({
            _type: 'groomingBooking',
            bookingNumber: 'TEST-1234',
            customerName: 'Test',
            customerPhone: '12345678',
            petType: 'dog',
            petName: 'TestPet',
            breedSize: 'small',
            package: 'standard',
            price: 1000,
            appointmentDate: new Date().toISOString(),
            status: 'pending',
            createdAt: new Date().toISOString(),
        });
        console.log("✅ Success! Created document:", result._id);
        // Clean up
        await client.delete(result._id);
        console.log("✅ Cleaned up.");
    } catch (error) {
        console.error("❌ Sanity Write Error:", error.message);
        console.error("Full Error:", error);
    }
}

testSanityWrite();
