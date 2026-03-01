
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { createClient } from "@sanity/client";
import * as fs from "fs";
import * as path from "path";

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2025-12-05',
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
});

async function fixBiolineLogo() {
    try {
        console.log("🛠️ Fixing Bioline Logo...");

        // Find the brand document
        const bioline = await client.fetch(`*[_type == "brand" && (slug.current == "bioline" || name == "Bioline")][0]`);
        if (!bioline) {
            console.error("❌ Bioline brand not found in Sanity");
            return;
        }

        console.log(`Found brand: ${bioline.name} (${bioline._id})`);

        // Upload the local Bioline.webp
        const logoPath = path.resolve("public/brands/Bioline.webp");
        if (!fs.existsSync(logoPath)) {
            console.error(`❌ Local logo not found at ${logoPath}`);
            return;
        }

        const buffer = fs.readFileSync(logoPath);
        console.log("📤 Uploading local Bioline.webp to Sanity...");
        const asset = await client.assets.upload('image', buffer, {
            filename: 'Bioline.webp',
            contentType: 'image/webp'
        });

        console.log(`✅ Uploaded asset ID: ${asset._id}`);

        await client.patch(bioline._id)
            .set({
                logo: {
                    _type: 'image',
                    asset: {
                        _type: 'reference',
                        _ref: asset._id
                    }
                },
                description: "Natural and eco-friendly pet care products."
            })
            .commit();

        console.log("✨ Bioline brand updated successfully!");

    } catch (error) {
        console.error("🏁 Error fixing Bioline logo:", error);
    }
}

fixBiolineLogo();
