
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@sanity/client";

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2025-12-05',
    useCdn: false,
});

async function debugImages() {
    // Check products with images array structure
    const products = await client.fetch(`*[_type == "product"][0...3]{
    _id,
    name,
    images,
    "imageUrls": images[].asset->url
  }`);

    console.log("Product image structures:");
    products.forEach((p: any) => {
        console.log(`\n${p.name}:`);
        console.log("  images array:", JSON.stringify(p.images, null, 2));
        console.log("  imageUrls:", p.imageUrls);
    });
}

debugImages();
