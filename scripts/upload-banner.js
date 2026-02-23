
const { createClient } = require("@sanity/client");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = "2024-02-05";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!token) {
    console.error("Missing SANITY_API_WRITE_TOKEN");
    process.exit(1);
}

const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
});

async function run() {
    const brandName = "Bioline";
    const imagePath = "C:\\Users\\fisto\\Downloads\\bioline  banner.png";

    try {
        // 1. Find the brand
        console.log(`Finding brand: ${brandName}...`);
        const query = `*[_type == "brand" && name match "${brandName}*"][0]`;
        const brand = await client.fetch(query);

        if (!brand) {
            console.error(`Brand '${brandName}' not found.`);
            return;
        }
        console.log(`Found brand: ${brand.name} (${brand._id})`);

        // 2. Upload the image
        console.log(`Uploading image from: ${imagePath}...`);
        if (!fs.existsSync(imagePath)) {
            console.error("Image file does not exist at path:", imagePath);
            return;
        }

        const imageBuffer = fs.readFileSync(imagePath);
        const asset = await client.assets.upload("image", imageBuffer, {
            filename: path.basename(imagePath),
        });
        console.log(`Image uploaded: ${asset._id}`);

        // 3. Patch the brand
        console.log("Updating brand document...");
        await client
            .patch(brand._id)
            .set({
                banner: {
                    _type: "image",
                    asset: {
                        _type: "reference",
                        _ref: asset._id,
                    },
                },
            })
            .commit();

        console.log("Brand updated successfully!");
        console.log(`Preview URL: http://localhost:3000/brands/${brand.slug.current}`);
    } catch (err) {
        console.error("Error:", err);
    }
}

run();
