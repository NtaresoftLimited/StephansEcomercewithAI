const { createClient } = require("@sanity/client");
const fs = require("fs");
require("dotenv").config({ path: ".env" });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: "2024-02-05",
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
});

async function run() {
    // 1. Upload logo
    const logoPath = "../bioline_logo.png";
    if (!fs.existsSync(logoPath)) {
        console.error("Logo file not found:", logoPath);
        process.exit(1);
    }
    console.log("Uploading Bioline logo to Sanity...");
    const asset = await client.assets.upload("image", fs.createReadStream(logoPath), {
        filename: "bioline-logo.png",
    });
    console.log("Logo asset ID:", asset._id);

    // 2. Find Bioline brand document
    const brand = await client.fetch(`*[_type=="brand" && name match "Bioline*"][0]{_id,name}`);
    if (!brand) { console.error("Bioline brand not found in Sanity"); process.exit(1); }
    console.log("Sanity brand:", brand._id, brand.name);

    // 3. Set logo on brand
    await client.patch(brand._id).set({
        logo: { _type: "image", asset: { _type: "reference", _ref: asset._id } }
    }).commit();
    console.log("Logo set on brand document.");
}

run().catch(console.error);
