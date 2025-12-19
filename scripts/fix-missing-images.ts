
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@sanity/client";
import { v4 as uuidv4 } from "uuid";
import https from 'https';

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2025-12-05',
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
});

// High-quality placeholders resembling the requested brands/products
const IMAGE_MAPPINGS = [
    {
        pattern: "Beeno",
        url: "https://images.unsplash.com/photo-1582798358481-d199fb7347bb?w=800&q=80", // Dog biscuits
        filename: "beeno-treats-placeholder.jpg"
    },
    {
        pattern: "Bioline",
        url: "https://images.unsplash.com/photo-1623945199616-5b4d79383b4b?w=800&q=80", // Spray bottle (care product)
        filename: "bioline-product-placeholder.jpg"
    },
    {
        pattern: "Alinana",
        url: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=800&q=80", // Cat toy
        filename: "alinana-toy-placeholder.jpg"
    },
    {
        pattern: "Amy's",
        url: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&q=80", // Leash
        filename: "amys-leash-placeholder.jpg"
    },
    {
        pattern: "Bear", // Bear Face Dog Bed (already has images usually, but for missing ones)
        url: "https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=800&q=80", // Dog bed
        filename: "dog-bed-placeholder.jpg"
    },
    {
        pattern: "Banana", // Banana Cloth
        url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80", // Dog clothes
        filename: "dog-clothes-placeholder.jpg"
    },
    {
        pattern: "Apple", // Apple Cloth
        url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80",
        filename: "dog-clothes-placeholder-2.jpg"
    }
];

async function uploadImageFromUrl(url: string, filename: string) {
    return new Promise<any>((resolve, reject) => {
        https.get(url, (res) => {
            const chunks: any[] = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', async () => {
                const buffer = Buffer.concat(chunks);
                try {
                    const asset = await client.assets.upload('image', buffer, { filename });
                    resolve(asset);
                } catch (err) {
                    reject(err);
                }
            });
            res.on('error', reject);
        });
    });
}

async function fixMissingImages() {
    console.log("🔍 Checking for products without images...");
    const products = await client.fetch(`*[_type == "product" && (!defined(images) || count(images) == 0)]{_id, name}`);

    console.log(`Found ${products.length} products missing images.`);

    for (const product of products) {
        const mapping = IMAGE_MAPPINGS.find(m => product.name.includes(m.pattern));

        if (mapping) {
            console.log(`Processing ${product.name} -> Using ${mapping.filename}`);
            try {
                const asset = await uploadImageFromUrl(mapping.url, mapping.filename);

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
                console.log(`  ✅ Updated ${product.name}`);
            } catch (err) {
                console.error(`  ❌ Failed to upload for ${product.name}:`, err);
            }
        } else {
            console.log(`  ⚠️ No mapping found for ${product.name}`);
        }
    }
}

fixMissingImages();
