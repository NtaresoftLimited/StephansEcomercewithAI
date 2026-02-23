const { createClient } = require("@sanity/client");
require("dotenv").config({ path: ".env" });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: "2024-02-05",
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
});

const BRANDS = [
    { name: "Bioline", odooId: 2 },
    { name: "Summit10", odooId: 5 },
    { name: "Tropicat", odooId: 14 },
    { name: "Tropidog", odooId: 13 }
];

async function run() {
    for (const brand of BRANDS) {
        console.log(`Processing ${brand.name}...`);
        const existing = await client.fetch(`*[_type == "brand" && name match $name]{_id, name}`, { name: brand.name + "*" });

        if (existing.length > 0) {
            console.log(`Updating ${brand.name} with odooId ${brand.odooId}...`);
            await client.patch(existing[0]._id).set({ odooId: brand.odooId }).commit();
        } else {
            console.log(`${brand.name} not found in Sanity. Creating...`);
            await client.create({
                _type: "brand",
                name: brand.name,
                slug: { _type: "slug", current: brand.name.toLowerCase() },
                odooId: brand.odooId
            });
        }
    }
    console.log("Done!");
}

run().catch(console.error);
