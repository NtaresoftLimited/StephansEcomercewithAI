require('dotenv').config();
const { createClient } = require('@sanity/client');
const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: "2023-05-03",
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
});

async function test() {
    try {
        await sanityClient.createIfNotExists({
            _type: "product",
            _id: "odoo-test1",
            name: "Test Name",
            slug: { _type: "slug", current: "test-name" },
        });
        console.log("Create successful");
        await sanityClient.patch("odoo-test1").set({ price: 10 }).commit();
        console.log("Patch successful");
    } catch(e) {
        console.error(e.message);
    }
}
test();
