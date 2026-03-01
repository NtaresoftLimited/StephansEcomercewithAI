import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2025-12-05',
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
});

async function main() {
    console.log("Updating TropiDog brand logo...");

    // Find Brand in Sanity
    const brandQuery = `*[_type == "brand" && slug.current == "tropidog"][0]`;
    const brand = await client.fetch(brandQuery);

    if (!brand) {
        console.error("❌ TropiDog brand not found in Sanity. Please ensure it has been synced and the slug is 'tropidog'.");
        return;
    }

    console.log(`Found brand: ${brand.name} (ID: ${brand._id})`);

    // Load Local SVG
    const svgPath = join(process.cwd(), "public", "brands", "TropiDog_logo.svg");
    if (!existsSync(svgPath)) {
        console.error(`❌ Logo file not found at ${svgPath}`);
        return;
    }

    console.log("Uploading SVG to Sanity...");
    const fileData = readFileSync(svgPath);

    try {
        const asset = await client.assets.upload('image', fileData, {
            filename: 'TropiDog_logo.svg',
            contentType: 'image/svg+xml' // explicitly state that it's an SVG
        });

        console.log(`Uploaded asset: ${asset._id}`);

        // Patch Document
        await client.patch(brand._id)
            .set({
                logo: {
                    _type: 'image',
                    asset: {
                        _type: 'reference',
                        _ref: asset._id
                    }
                }
            })
            .commit();

        console.log("✅ Successfully patched TropiDog brand with new logo!");
    } catch (err) {
        console.error("Failed to upload/patch:", err);
    }
}

main().catch(console.error);
