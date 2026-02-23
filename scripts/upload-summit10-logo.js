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

const LOGO_PATH = "C:\\Users\\fisto\\Downloads\\Summit-10.svg";
const BRAND_NAME = "Summit10";

async function run() {
    if (!fs.existsSync(LOGO_PATH)) {
        console.error(`File not found: ${LOGO_PATH}`);
        process.exit(1);
    }

    console.log(`Reading logo from ${LOGO_PATH}...`);
    const logoBuffer = fs.readFileSync(LOGO_PATH);

    console.log("Uploading logo to Sanity...");
    const asset = await client.assets.upload("image", logoBuffer, {
        filename: path.basename(LOGO_PATH),
        contentType: "image/svg+xml",
    });

    console.log(`Logo asset uploaded: ${asset._id}`);

    console.log(`Searching for brand: ${BRAND_NAME}...`);
    const brands = await client.fetch(
        `*[_type == "brand" && name match $name]{_id, name}`,
        { name: BRAND_NAME + "*" }
    );

    if (brands.length === 0) {
        console.error(`Brand not found in Sanity: ${BRAND_NAME}`);
        process.exit(1);
    }

    const brand = brands[0];
    console.log(`Updating brand: ${brand.name} (${brand._id})...`);

    await client
        .patch(brand._id)
        .set({
            logo: {
                _type: "image",
                asset: {
                    _type: "reference",
                    _ref: asset._id,
                },
            },
        })
        .commit();

    console.log("Successfully updated brand logo!");
}

run().catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
});
