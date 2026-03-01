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

async function syncMissingProducts() {
    console.log("🚀 Starting incremental sync of MISSING products from Odoo to Sanity...");

    try {
        // Fetch categories & brands for references
        const sanityCategories = await client.fetch(`*[_type == "category"]{_id, title, slug}`);
        const sanityBrands = await client.fetch(`*[_type == "brand"]{_id, name, odooId}`);

        // Fetch products currently in Sanity
        console.log("Checking Sanity products...");
        const sanityProducts = await client.fetch(`*[_type == "product"]{_id, name, odooId}`);
        const sanityOdooIds = new Set(sanityProducts.map((p: any) => p.odooId).filter(Boolean));

        // Fetch all active products from Odoo WITHOUT images first to avoid timeouts
        console.log("📦 Fetching products from Odoo (IDs only)...");
        const odooProductsLight = await odoo.searchRead(
            "product.template",
            [["sale_ok", "=", true], ["active", "=", true]],
            ["name", "id"],
            2000
        );

        // Identify missing products
        const missingProductIds = odooProductsLight
            .filter((p: any) => !sanityOdooIds.has(p.id))
            .map((p: any) => p.id);

        console.log(`Found ${missingProductIds.length} missing products to sync.`);

        if (missingProductIds.length === 0) {
            console.log("Everything is already up to date!");
            return;
        }

        // Import missing Products in batches
        let count = 0;
        const batchSize = 10;

        for (let i = 0; i < missingProductIds.length; i += batchSize) {
            const batchIds = missingProductIds.slice(i, i + batchSize);
            console.log(`\n--- Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(missingProductIds.length / batchSize)} ---`);

            const batchProducts = await odoo.searchRead(
                "product.template",
                [["id", "in", batchIds]],
                ["name", "list_price", "description_sale", "categ_id", "qty_available", "image_1920", "id", "product_variant_count", "brand_id"],
                batchSize
            );

            for (const op of batchProducts) {
                console.log(`[${++count}/${missingProductIds.length}] Processing: ${op.name}...`);

                // Collect all images
                const allImages: SanityImage[] = [];

                // Main image
                if (op.image_1920) {
                    const mainImage = await uploadImage(op.image_1920, `odoo-${op.id}-main.jpg`);
                    if (mainImage) allImages.push(mainImage);
                }

                // Fetch additional images from product.image model
                try {
                    const additionalImages = await odoo.getProductImages(op.id);
                    for (let i = 0; i < additionalImages.length; i++) {
                        const img = additionalImages[i];
                        if (img.image_1920) {
                            const uploadedImg = await uploadImage(
                                img.image_1920,
                                `odoo-${op.id}-img-${i + 1}.jpg`
                            );
                            if (uploadedImg) allImages.push(uploadedImg);
                        }
                    }
                } catch (imgError) {
                    // Quietly handle cases with no additional images
                }

                // Fetch product variants
                const variants: SanityVariant[] = [];
                try {
                    const odooVariants = await odoo.getProductVariants(op.id);
                    for (const variant of odooVariants) {
                        if (odooVariants.length > 1 || variant.display_name !== op.name) {
                            variants.push({
                                _type: 'productVariant',
                                _key: uuidv4(),
                                name: variant.display_name || variant.name || op.name,
                                sku: variant.default_code || undefined,
                                price: variant.lst_price || variant.list_price || op.list_price || 0,
                                stock: Math.max(0, Math.floor(variant.qty_available || 0)),
                                weight: variant.weight ? `${variant.weight}kg` : undefined,
                                odooVariantId: variant.id
                            });
                        }
                    }
                } catch (variantError) {
                    // Quietly handle cases with no variants
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

                // Brand mapping
                let brandRef = undefined;
                if (op.brand_id) {
                    const brandIdFromOdoo = op.brand_id[0];
                    const matchingBrand = sanityBrands.find((b: any) => b.odooId === brandIdFromOdoo);
                    if (matchingBrand) {
                        brandRef = { _type: 'reference', _ref: matchingBrand._id };
                    } else {
                        brandRef = { _type: 'reference', _ref: `brand-odoo-${brandIdFromOdoo}` };
                    }
                }

                // Create product document
                try {
                    await client.createIfNotExists({
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
                        brand: brandRef,
                        images: allImages.length > 0 ? allImages : [],
                        variants: variants.length > 0 ? variants : undefined,
                        odooId: op.id,
                        featured: Math.random() > 0.8
                    });
                    console.log(`  - ✅ Synced: ${op.name}`);
                } catch (err) {
                    console.error(`  - ❌ Error: ${op.name}`, err);
                }
            } // End of inner batch loop
        } // End of outer batch loop

        console.log("✨ Missing products sync finished!");

    } catch (error) {
        console.error("🏁 Sync Failed:", error);
    }
}

syncMissingProducts();
