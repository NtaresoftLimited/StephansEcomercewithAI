
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@sanity/client";
import { odoo } from "../lib/odoo/client";
import { v4 as uuidv4 } from "uuid";

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2025-12-05',
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
});

async function testOne() {
    try {
        const odooProducts = await odoo.searchRead(
            "product.template",
            [["sale_ok", "=", true], ["image_1920", "!=", false]],
            ["name", "image_1920"],
            1
        );

        if (odooProducts.length === 0) {
            console.log("No products with images found in Odoo.");
            return;
        }

        const op = odooProducts[0];
        console.log(`Processing: ${op.name}`);

        const buffer = Buffer.from(op.image_1920, 'base64');
        const asset = await client.assets.upload('image', buffer, {
            filename: `test-${op.id}.jpg`
        });
        console.log("Asset Uploaded ID:", asset._id);
        console.log("Asset Uploaded URL:", asset.url);

        const cat = await client.fetch(`*[_type == "category"][0]{_id}`);
        if (!cat) {
            console.log("No category found in Sanity.");
            return;
        }

        const doc = {
            _type: 'product',
            _id: `test-sync-${op.id}`,
            name: op.name,
            slug: { _type: 'slug', current: 'test-' + op.id },
            price: 100,
            category: { _type: 'reference', _ref: cat._id },
            images: [{
                _type: 'image',
                _key: uuidv4(),
                asset: {
                    _type: 'reference',
                    _ref: asset._id
                }
            }]
        };

        const result = await client.createOrReplace(doc);
        console.log("Product Created ID:", result._id);

        // Fetch back with dereference
        const fetched = await client.fetch(`*[_id == $id][0]{
            name,
            "images": images[]{
              asset->{
                url
              }
            }
        }`, { id: result._id });

        console.log("Fetched Result:");
        console.log(JSON.stringify(fetched, null, 2));

    } catch (err) {
        console.error("Test failed:", err);
    }
}

testOne();
