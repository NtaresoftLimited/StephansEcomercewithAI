
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { createClient } from "@sanity/client";

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2025-12-05',
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
});

async function checkData() {
    const brands = await client.fetch(`*[_type == "brand"]{_id, name, slug}`);
    console.log("Brands in Sanity:", JSON.stringify(brands, null, 2));

    const productsWithBrand = await client.fetch(`*[_type == "product" && defined(brand)]{_id, name, brand}`);
    console.log("Products with Brand reference:", productsWithBrand.length);
    if (productsWithBrand.length > 0) {
        console.log("Sample product with brand:", JSON.stringify(productsWithBrand[0], null, 2));
    }
}

checkData();
