
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@sanity/client";

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2025-12-05',
    useCdn: false,
});

async function verify() {
    const count = await client.fetch(`count(*[_type == "product"])`);
    console.log("Total products:", count);

    const products = await client.fetch(`*[_type == "product"][0...5]{
    name,
    price,
    "imageUrl": images[0].asset->url
  }`);
    console.log("Sample products:");
    console.log(JSON.stringify(products, null, 2));
}

verify();
