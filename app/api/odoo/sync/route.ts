import { NextResponse } from "next/server";
import { odoo } from "@/lib/odoo/client";
import { createClient } from "@sanity/client";

const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: "2025-12-05",
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
});

/**
 * API endpoint to sync products from Odoo to Sanity
 * POST /api/odoo/sync
 * 
 * Can be called by:
 * - Vercel Cron Jobs (scheduled)
 * - Odoo Webhooks (real-time)
 * - Admin manually
 */
async function getOrCreateCategory(name: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    // Check if category exists
    const existing = await sanityClient.fetch(
        `*[_type == "category" && slug.current == $slug][0]`,
        { slug }
    );

    if (existing) return existing._id;

    // Create new category
    const created = await sanityClient.create({
        _type: "category",
        title: name,
        slug: { _type: "slug", current: slug },
        order: 0
    });

    return created._id;
}

async function uploadOdooImage(base64: string, filename: string) {
    if (!base64 || base64.length < 100) return null;

    try {
        const buffer = Buffer.from(base64, "base64");
        const asset = await sanityClient.assets.upload("image", buffer, {
            filename: `${filename}.jpg`,
            contentType: "image/jpeg"
        });
        return asset._id;
    } catch (error) {
        console.error("Image upload failed:", error);
        return null;
    }
}

async function runSync() {
    // Fetch products from Odoo with more fields
    const odooProducts = await odoo.searchRead(
        "product.template",
        [["sale_ok", "=", true]],
        [
            "id",
            "name",
            "list_price",
            "description_sale",
            "categ_id",
            "qty_available",
            "image_1920",
            "product_variant_ids"
        ],
        50 // Reduced limit for safer sync with images
    );

    let synced = 0;
    let errors = 0;

    for (const product of odooProducts) {
        try {
            const sanityId = `odoo-${product.id}`;
            const slug = product.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "") + `-${product.id}`;

            // 1. Handle Category
            let categoryRef = undefined;
            if (product.categ_id && Array.isArray(product.categ_id)) {
                const catId = await getOrCreateCategory(product.categ_id[1]);
                categoryRef = { _type: "reference", _ref: catId };
            }

            // 2. Handle Image (Upload if not exists optionally, but here we upload main)
            let imageAssetId = null;
            if (product.image_1920) {
                imageAssetId = await uploadOdooImage(product.image_1920, `product-${product.id}`);
            }

            // 3. Handle Variants (Optional detail)
            // For now, mapping base stock and price. 
            // In a full sync, we'd fetch product.product variants here.

            // 4. Create or Update (Non-destructive)
            await sanityClient.createIfNotExists({
                _type: "product",
                _id: sanityId,
                name: product.name,
                slug: { _type: "slug", current: slug },
            });

            const patch = sanityClient.patch(sanityId).set({
                name: product.name,
                price: product.list_price || 0,
                description: product.description_sale || product.name,
                stock: Math.max(0, Math.floor(product.qty_available || 0)),
                odooId: product.id,
            });

            if (categoryRef) patch.set({ category: categoryRef });
            if (imageAssetId) {
                patch.setIfMissing({ images: [] });
                patch.insert("replace", "images[0]", [{
                    _type: "image",
                    _key: `odoo-img-${product.id}`,
                    asset: { _type: "reference", _ref: imageAssetId }
                }]);
            }

            await patch.commit();
            synced++;
        } catch (err) {
            console.error(`Failed to sync product ${product.name}:`, err);
            errors++;
        }
    }
    return { synced, errors, total: odooProducts.length };
}

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const result = await runSync();
        return NextResponse.json({
            success: true,
            ...result,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Sync failed", details: String(error) },
            { status: 500 }
        );
    }
}

// GET endpoint to check sync status or trigger manually (if authorized)
export async function GET(request: Request) {
    const url = new URL(request.url);
    const secret = url.searchParams.get("secret");
    const cronHeader = request.headers.get("x-vercel-cron");
    const cronSecret = process.env.CRON_SECRET;

    // For manual browser trigger, check secret
    const authorized = (cronHeader && cronHeader.length > 0) || (cronSecret && secret === cronSecret);

    if (!authorized && process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await runSync();
        return NextResponse.json({
            success: true,
            ...result,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Sync failed", details: String(error) },
            { status: 500 }
        );
    }
}
