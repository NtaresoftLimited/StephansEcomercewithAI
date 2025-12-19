
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@sanity/client";

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2025-12-05',
    useCdn: false,
});

async function listMissingImages() {
    const products = await client.fetch(`*[_type == "product" && (!defined(images) || count(images) == 0)]{name}`);
    console.log("Products without images:", JSON.stringify(products, null, 2));
}

listMissingImages();
