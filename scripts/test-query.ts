
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@sanity/client";

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2025-12-05',
    useCdn: false,
});

async function testQuery() {
    // Simulate the exact query used by the homepage
    const products = await client.fetch(`*[
    _type == "product"
    && ("" == "" || category->slug.current == "")
    && ("" == "" || color == "")
    && ("" == "" || material == "")
    && (0 == 0 || price >= 0)
    && (0 == 0 || price <= 0)
    && ("" == "" || name match "" + "*" || description match "" + "*")
    && (false == false || stock > 0)
  ] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    price,
    "images": images[0...4]{
      _key,
      asset->{
        _id,
        url
      }
    },
    category->{
      _id,
      title,
      "slug": slug.current
    },
    material,
    color,
    stock
  }[0...3]`);

    console.log("Query result sample:");
    products.forEach((p: any) => {
        console.log(`\n${p.name}:`);
        console.log("  images:", JSON.stringify(p.images, null, 2));
        console.log("  First image URL:", p.images?.[0]?.asset?.url);
    });
}

testQuery();
