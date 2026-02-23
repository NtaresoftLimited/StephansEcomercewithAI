const { createClient } = require("@sanity/client");
require("dotenv").config({ path: ".env" });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: "2024-02-05",
    useCdn: false,
});

async function run() {
    const brands = await client.fetch('*[_type == "brand" && defined(odooId)]{name, "logoUrl": logo.asset->url}');
    console.log(JSON.stringify(brands, null, 2));
}

run().catch(console.error);
