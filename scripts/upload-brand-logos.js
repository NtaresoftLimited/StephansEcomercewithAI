const { createClient } = require("@sanity/client");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env" });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: "2024-02-05",
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
});

const LOGOS = [
    { name: "Summit10", path: "C:\\Users\\fisto\\Downloads\\Summit-10.svg", odooId: 2667 }, // ID from prev turns or just name match
    { name: "Tropicat", path: "C:\\Users\\fisto\\Downloads\\TropiCat_logo.svg" }
];

async function run() {
    for (const logo of LOGOS) {
        if (!fs.existsSync(logo.path)) {
            console.log(`Skipping ${logo.name}, file not found: ${logo.path}`);
            continue;
        }

        console.log(`Processing ${logo.name}...`);

        // Upload asset
        const logoBuffer = fs.readFileSync(logo.path);
        const asset = await client.assets.upload("image", logoBuffer, {
            filename: path.basename(logo.path),
            contentType: "image/svg+xml",
        });
        console.log(`Uploaded asset ${asset._id} for ${logo.name}`);

        // Find or Create Brand
        const brands = await client.fetch(`*[_type == "brand" && name match $name]{_id, name}`, { name: logo.name + "*" });
        let brandId;
        if (brands.length === 0) {
            console.log(`Creating brand ${logo.name}...`);
            const newBrand = await client.create({
                _type: "brand",
                name: logo.name,
                slug: { _type: "slug", current: logo.name.toLowerCase() },
            });
            brandId = newBrand._id;
        } else {
            brandId = brands[0]._id;
            console.log(`Found existing brand ${logo.name}: ${brandId}`);
        }

        // Update with logo
        await client.patch(brandId).set({
            logo: {
                _type: "image",
                asset: { _type: "reference", _ref: asset._id }
            }
        }).commit();
        console.log(`Updated ${logo.name} with new logo.`);
    }

    // Final cleanup of duplicate Bioline
    const biolines = await client.fetch('*[_type == "brand" && name == "Bioline"]{_id, odooId}');
    const duplicate = biolines.find(b => !b.odooId);
    if (duplicate) {
        console.log(`Deleting duplicate Bioline ${duplicate._id}...`);
        await client.delete(duplicate._id);
    }

    console.log("Done!");
}

run().catch(console.error);
