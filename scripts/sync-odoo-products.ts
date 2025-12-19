
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

async function syncOdoo() {
    console.log("🚀 Starting Aggressive Odoo to Sanity Sync...");

    try {
        // 1. CLEAR EVERYTHING (except categories)
        console.log("🧹 Clearing orders and products...");
        const allToDelete = await client.fetch(`*[_type in ["product", "order", "customer"]] { _id }`);
        console.log(`Found ${allToDelete.length} records to delete.`);

        if (allToDelete.length > 0) {
            const batchSize = 100;
            for (let i = 0; i < allToDelete.length; i += batchSize) {
                const batch = allToDelete.slice(i, i + batchSize);
                const transaction = client.transaction();
                batch.forEach((doc: any) => transaction.delete(doc._id));
                await transaction.commit();
                console.log(`Deleted batch ${i / batchSize + 1}`);
            }
        }

        // 2. Fetch categories
        const sanityCategories = await client.fetch(`*[_type == "category"]{_id, title, slug}`);
        console.log(`Found ${sanityCategories.length} categories.`);

        // 3. Fetch products from Odoo
        console.log("📦 Fetching products from Odoo...");
        const odooProducts = await odoo.searchRead(
            "product.template",
            [["sale_ok", "=", true]],
            ["name", "list_price", "description_sale", "categ_id", "qty_available", "image_1920", "id"],
            100 // Sync up to 100 products
        );
        console.log(`Fetched ${odooProducts.length} products from Odoo.`);

        // 4. Import Products
        for (const op of odooProducts) {
            console.log(`Processing: ${op.name}...`);

            // Image processing
            let mainImage = null;
            if (op.image_1920 && op.image_1920.length > 100) { // Basic check for valid base64
                try {
                    const buffer = Buffer.from(op.image_1920, 'base64');
                    const asset = await client.assets.upload('image', buffer, {
                        filename: `odoo-${op.id}.jpg`,
                        contentType: 'image/jpeg'
                    });
                    mainImage = {
                        _type: 'image',
                        _key: uuidv4(),
                        asset: {
                            _type: 'reference',
                            _ref: asset._id
                        }
                    };
                } catch (imgError) {
                    console.error(`  - Failed image: ${op.name}`);
                }
            }

            // Category mapping
            const odooCatName = op.categ_id ? op.categ_id[1] : "General";
            let categoryRef = null;

            const match = sanityCategories.find((c: any) =>
                c.title.toLowerCase().includes(odooCatName.toLowerCase()) ||
                odooCatName.toLowerCase().includes(c.title.toLowerCase())
            );

            if (match) {
                categoryRef = { _type: 'reference', _ref: match._id };
            } else if (sanityCategories.length > 0) {
                categoryRef = { _type: 'reference', _ref: sanityCategories[0]._id };
            }

            // Create
            try {
                await client.create({
                    _type: 'product',
                    _id: `odoo-${op.id}`,
                    name: op.name,
                    slug: {
                        _type: 'slug',
                        current: op.name.toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-+|-+$/g, '') + '-' + op.id
                    },
                    description: op.description_sale || op.name,
                    price: op.list_price || 0,
                    stock: Math.max(0, Math.floor(op.qty_available || 0)),
                    category: categoryRef,
                    images: mainImage ? [mainImage] : [],
                    odooId: op.id,
                    featured: Math.random() > 0.8
                });
                console.log(`  - ✅ Synced: ${op.name}`);
            } catch (err) {
                console.error(`  - ❌ Error: ${op.name}`);
            }
        }

        console.log("✨ Odoo Sync Finished!");

    } catch (error) {
        console.error("🏁 Sync Failed:", error);
    }
}

syncOdoo();
