
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { createClient } from "@sanity/client";
import { odoo } from "../lib/odoo/client";
import { v4 as uuidv4 } from "uuid";

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2025-12-05',
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
});

async function uploadLogo(base64Data: string, filename: string) {
    if (!base64Data || base64Data.length < 100) return null;

    try {
        const buffer = Buffer.from(base64Data, 'base64');
        const asset = await client.assets.upload('image', buffer, {
            filename,
            contentType: 'image/png'
        });
        return {
            _type: 'image',
            asset: {
                _type: 'reference',
                _ref: asset._id
            }
        };
    } catch (error) {
        console.error(`  - Failed to upload logo: ${filename}`);
        return null;
    }
}

async function syncBrands() {
    console.log("🚀 Syncing Brands from Odoo to Sanity...");

    try {
        const odooBrands = await odoo.getBrands();
        console.log(`Fetched ${odooBrands.length} brands from Odoo.`);

        for (const brand of odooBrands) {
            console.log(`Processing Brand: ${brand.name}...`);

            const logoAsset = await uploadLogo(brand.logo, `brand-${brand.id}.png`);

            const sanityBrand = {
                _type: 'brand',
                _id: `brand-odoo-${brand.id}`,
                name: brand.name,
                slug: {
                    _type: 'slug',
                    current: brand.name.toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '')
                },
                logo: logoAsset || undefined,
                odooId: brand.id
            };

            await client.createOrReplace(sanityBrand);
            console.log(`  - ✅ Synced: ${brand.name}`);
        }

        console.log("✨ Brand Sync Finished!");
    } catch (error) {
        console.error("🏁 Brand Sync Failed:", error);
    }
}

syncBrands();
