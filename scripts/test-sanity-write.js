
require('dotenv').config();
const { createClient } = require('@sanity/client');

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;

async function testSanity() {
    console.log(`Testing Sanity Write for project ${projectId}...`);
    if (!token) {
        console.error("❌ SANITY_API_WRITE_TOKEN is missing in .env");
        return;
    }

    const client = createClient({
        projectId,
        dataset,
        apiVersion: '2024-01-01',
        token,
        useCdn: false,
    });

    try {
        const testDoc = {
            _type: 'groomingBooking',
            bookingNumber: 'TEST-' + Date.now(),
            customerName: 'Test Runner',
            petName: 'Test Pet',
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        console.log("Attempting to create test document...");
        const result = await client.create(testDoc);
        console.log("✅ Success! Created doc ID:", result._id);
        
        // Cleanup
        await client.delete(result._id);
        console.log("✅ Cleaned up test document.");
    } catch (e) {
        console.error("❌ Sanity Write Error:", e.message);
        if (e.response) {
            console.error("Response:", e.response.body);
        }
    }
}

testSanity();
