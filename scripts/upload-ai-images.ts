
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@sanity/client";
import { createReadStream } from "fs";
import { basename } from "path";
import { v4 as uuidv4 } from "uuid";

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2025-12-05',
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
});

const updates = [
    {
        productName: "Bioline Flea & Tick Collar For Cat",
        imagePath: "C:/Users/fisto/.gemini/antigravity/brain/e641eab2-0441-4a33-8475-3966e93fc973/bioline_flea_collar_1766117746114.png"
    },
    {
        productName: "Balang Square Dog Bed",
        imagePath: "C:/Users/fisto/.gemini/antigravity/brain/e641eab2-0441-4a33-8475-3966e93fc973/balang_dog_bed_1766117761405.png"
    }
];

async function applyUpdates() {
    for (const item of updates) {
        console.log(`Processing ${item.productName}...`);

        // 1. Find the product
        const product = await client.fetch(`*[_type == "product" && name match "${item.productName}"][0]{_id, name}`);
        if (!product) {
            console.log(`  - Product not found: ${item.productName}`);
            continue;
        }

        // 2. Upload Image
        console.log(`  - Uploading image: ${basename(item.imagePath)}`);
        const stream = createReadStream(item.imagePath);
        const asset = await client.assets.upload('image', stream, {
            filename: basename(item.imagePath)
        });

        // 3. Patch Product
        console.log(`  - Updating product ${product._id}...`);
        await client.patch(product._id)
            .set({
                images: [{
                    _type: 'image',
                    _key: uuidv4(),
                    asset: {
                        _type: 'reference',
                        _ref: asset._id
                    }
                }]
            })
            .commit();

        console.log(`  - ✅ Updated!`);
    }
}

applyUpdates();
