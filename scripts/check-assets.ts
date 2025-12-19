
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@sanity/client";

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2025-12-05',
    useCdn: false,
});

async function check() {
    const assets = await client.fetch(`*[_type == "sanity.imageAsset"][0...3]{url, metadata}`);
    console.log(JSON.stringify(assets, null, 2));
}

check();
