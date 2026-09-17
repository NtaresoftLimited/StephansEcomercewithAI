require('dotenv').config();
const { createClient } = require('@sanity/client');
const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: "2023-05-03",
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
});

async function testPatch() {
    try {
        await sanityClient.patch("odoo-1102").set({ name: "Test" }).commit();
        console.log("Patch successful");
    } catch (e) {
        console.error("Patch failed:", e.message);
    }
}
testPatch();
