
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@sanity/client";

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2025-12-05',
    useCdn: false,
});

async function countImages() {
    const withImages = await client.fetch(`count(*[_type == "product" && count(images) > 0])`);
    const withoutImages = await client.fetch(`count(*[_type == "product" && count(images) == 0])`);

    console.log("Products WITH images:", withImages);
    console.log("Products WITHOUT images:", withoutImages);
}

countImages();
