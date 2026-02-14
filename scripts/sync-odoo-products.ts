
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

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

interface SanityImage {
    _type: 'image';
    _key: string;
    asset: {
        _type: 'reference';
        _ref: string;
    };
}

interface SanityVariant {
    _type: 'productVariant';
    _key: string;
    name: string;
    sku?: string;
    price: number;
    stock: number;
    weight?: string;
    odooVariantId: number;
}

/**
 * Upload a base64 image to Sanity
 */
async function uploadImage(base64Data: string, filename: string): Promise<SanityImage | null> {
    if (!base64Data || base64Data.length < 100) return null;

    try {
        const buffer = Buffer.from(base64Data, 'base64');
        const asset = await client.assets.upload('image', buffer, {
            filename,
            contentType: 'image/jpeg'
        });
        return {
            _type: 'image',
            _key: uuidv4(),
            asset: {
                _type: 'reference',
                _ref: asset._id
            }
        };
    } catch (error) {
        console.error(`  - Failed to upload image: ${filename}`);
        return null;
    }
}

async function syncOdoo() {
    console.log("🚀 Starting Enhanced Odoo to Sanity Sync (with images & variants)...");

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
            ["name", "list_price", "description_sale", "categ_id", "qty_available", "image_1920", "id", "product_variant_count", "brand_id"],
            100
        );
        console.log(`Fetched ${odooProducts.length} products from Odoo.`);

        // 4. Import Products with all images and variants
        for (const op of odooProducts) {
            console.log(`Processing: ${op.name}...`);

            // Collect all images
            const allImages: SanityImage[] = [];

            // Main image
            const mainImage = await uploadImage(op.image_1920, `odoo-${op.id}-main.jpg`);
            if (mainImage) {
                allImages.push(mainImage);
            }

            // Fetch additional images from product.image model
            try {
                const additionalImages = await odoo.getProductImages(op.id);
                console.log(`  - Found ${additionalImages.length} additional images`);

                for (let i = 0; i < additionalImages.length; i++) {
                    const img = additionalImages[i];
                    if (img.image_1920) {
                        const uploadedImg = await uploadImage(
                            img.image_1920,
                            `odoo-${op.id}-img-${i + 1}.jpg`
                        );
                        if (uploadedImg) {
                            allImages.push(uploadedImg);
                        }
                    }
                }
            } catch (imgError) {
                console.log(`  - No additional images or error fetching`);
            }

            // Fetch product variants
            const variants: SanityVariant[] = [];
            try {
                const odooVariants = await odoo.getProductVariants(op.id);
                console.log(`  - Found ${odooVariants.length} variants`);

                for (const variant of odooVariants) {
                    // Only add variants if product has more than 1 variant
                    if (odooVariants.length > 1 || variant.display_name !== op.name) {
                        variants.push({
                            _type: 'productVariant',
                            _key: uuidv4(),
                            name: variant.display_name || variant.name,
                            sku: variant.default_code || undefined,
                            price: variant.lst_price || variant.list_price || op.list_price || 0,
                            stock: Math.max(0, Math.floor(variant.qty_available || 0)),
                            weight: variant.weight ? `${variant.weight}kg` : undefined,
                            odooVariantId: variant.id
                        });
                    }
                }
            } catch (variantError) {
                console.log(`  - No variants or error fetching`);
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

            // Create product document
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
                    brand: op.brand_id ? { _type: 'reference', _ref: `brand-odoo-${op.brand_id[0]}` } : undefined,
                    images: allImages.length > 0 ? allImages : [],
                    variants: variants.length > 0 ? variants : undefined,
                    odooId: op.id,
                    featured: Math.random() > 0.8
                });
                console.log(`  - ✅ Synced: ${op.name} (${allImages.length} images, ${variants.length} variants)`);
            } catch (err) {
                console.error(`  - ❌ Error: ${op.name}`, err);
            }
        }

        console.log("✨ Enhanced Odoo Sync Finished!");

    } catch (error) {
        console.error("🏁 Sync Failed:", error);
    }
}

syncOdoo();

