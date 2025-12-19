
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@sanity/client";

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2025-12-05',
    useCdn: false,
});

async function diagnose() {
    console.log("=== DIAGNOSING SANITY DATA ===\n");

    // 1. Check categories
    const categories = await client.fetch(`*[_type == "category"]{_id, title, "slug": slug.current}`);
    console.log("CATEGORIES:", JSON.stringify(categories, null, 2));

    // 2. Check a sample product with full image data
    const sampleProduct = await client.fetch(`*[_type == "product"][0]{
    _id,
    name,
    images,
    "imageUrls": images[].asset->url,
    category->{_id, title}
  }`);
    console.log("\nSAMPLE PRODUCT:", JSON.stringify(sampleProduct, null, 2));

    // 3. Check image assets directly
    const assets = await client.fetch(`*[_type == "sanity.imageAsset"][0...3]{_id, url}`);
    console.log("\nIMAGE ASSETS:", JSON.stringify(assets, null, 2));

    // 4. Count products by category
    const productsByCategory = await client.fetch(`{
    "total": count(*[_type == "product"]),
    "withCategory": count(*[_type == "product" && defined(category)]),
    "withImages": count(*[_type == "product" && count(images) > 0])
  }`);
    console.log("\nPRODUCT STATS:", JSON.stringify(productsByCategory, null, 2));
}

diagnose();
