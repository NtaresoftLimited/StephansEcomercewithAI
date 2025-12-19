
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@sanity/client";

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-12-05',
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
});

async function cleanup() {
    console.log("🧹 Cleaning up Sanity data...");
    try {
        // 1. Delete all orders
        const orders = await client.fetch(`*[_type == "order"]{_id}`);
        console.log(`Found ${orders.length} orders.`);
        if (orders.length > 0) {
            const trans = client.transaction();
            orders.forEach(o => trans.delete(o._id));
            await trans.commit();
            console.log("Deleted all orders.");
        }

        // 2. Delete all products
        const products = await client.fetch(`*[_type == "product"]{_id}`);
        console.log(`Found ${products.length} products.`);
        if (products.length > 0) {
            const trans = client.transaction();
            products.forEach(p => trans.delete(p._id));
            await trans.commit();
            console.log("Deleted all products.");
        }

        console.log("✨ Cleanup complete!");
    } catch (e) {
        console.error("Cleanup failed:", e);
    }
}

cleanup();
