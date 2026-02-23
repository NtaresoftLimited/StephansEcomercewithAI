const { createClient } = require("@sanity/client");
require("dotenv").config({ path: ".env" });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: "2024-02-05",
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
});

// Hardcoded Odoo brands from recent check
const odooBrandNames = [
    "Bioline",
    "Summit10",
    "Tropicat",
    "Tropidog"
];

async function run() {
    const sanityBrands = await client.fetch(`*[_type=="brand"]{_id, name}`);
    console.log(`Found ${sanityBrands.length} brands in Sanity.`);

    let deletedCount = 0;
    for (const b of sanityBrands) {
        // if the sanity brand name is not exactly matching one of the Odoo brands (case-insensitive)
        const match = odooBrandNames.find(ob => ob.toLowerCase() === b.name.toLowerCase());
        if (!match) {
            console.log(`Deleting ${b.name} (${b._id}) because it is not in Odoo...`);
            try {
                await client.delete(b._id);
                deletedCount++;
            } catch (e) {
                console.error(`Failed to delete ${b._id}:`, e.message);
            }
        } else {
            console.log(`Keeping ${b.name} (${b._id}) - matches Odoo brand`);
        }
    }
    console.log(`Deleted ${deletedCount} non-odoo brands from Sanity.`);
}

run().catch(console.error);
