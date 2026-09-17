import { NextResponse } from "next/server";
import { odoo } from "@/lib/odoo/client";
import { createClient } from "@sanity/client";

const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ubqcgegx',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
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

async function getOrCreateBrand(name: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    
    const existing = await sanityClient.fetch(
        `*[_type == "brand" && slug.current == $slug][0]`,
        { slug }
    );
    if (existing) return existing._id;

    const created = await sanityClient.create({
        _type: "brand",
        name: name,
        slug: { _type: "slug", current: slug },
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
    // 1. Handle Deletions first
    // Fetch ALL active product IDs from Odoo (lightweight query)
    const activeOdooProductsFast = await odoo.searchRead(
        "product.template",
        [["sale_ok", "=", true], ["active", "=", true]],
        ["id"]
    );
    const activeOdooIds = new Set(activeOdooProductsFast.map(p => p.id));

    // Fetch all Odoo-linked products from Sanity
    const sanityOdooProducts: Array<{ _id: string; odooId?: number; odooLastModified?: string; hasImage: boolean }> = await sanityClient.fetch(
        `*[_type == "product" && (defined(odooId) || _id match "odoo-*")]{_id, odooId, odooLastModified, "hasImage": defined(images[0].asset)}`
    );

    const sanityProductsMap = new Map<string, { _id: string; odooId?: number; odooLastModified?: string; hasImage: boolean }>(
        sanityOdooProducts.map(p => [p._id, p])
    );


    let deleted = 0;
    // Check which Sanity products are no longer active in Odoo
    for (const sp of sanityOdooProducts) {
        // Extract ID either from odooId field or from the _id string
        let idToCheck = sp.odooId;
        if (!idToCheck && sp._id.startsWith("odoo-")) {
            idToCheck = parseInt(sp._id.replace("odoo-", ""), 10);
        }

        if (idToCheck && !activeOdooIds.has(idToCheck)) {
            try {
                await sanityClient.delete(sp._id);
                console.log(`Deleted archived Odoo product from Sanity: ${sp._id}`);
                deleted++;
            } catch (err) {
                console.error(`Failed to delete archived product ${sp._id}:`, err);
            }
        }
    }

    // 2. Fetch products from Odoo with more fields for updating
    const odooProducts = await odoo.searchRead(
        "product.template",
        [["sale_ok", "=", true], ["active", "=", true]],
        [
            "id",
            "name",
            "list_price",
            "description_sale",
            "categ_id",
            "qty_available",
            "image_1920",
            "product_variant_ids",
            "write_date"
        ]
        // Removed limit of 50 so we sync ALL products
    );

    let synced = 0;
    let errors = 0;
    let errorDetails: any[] = [];

    for (const product of odooProducts) {
        try {
            const sanityId = `odoo-${product.id}`;
            const slug = product.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "") + `-${product.id}`;

            // 1. Handle Category — use only the leaf name from Odoo's full path
            let categoryRef = undefined;
            if (product.categ_id && Array.isArray(product.categ_id)) {
                const fullPath = product.categ_id[1] as string;
                const leafName = fullPath.includes(' / ')
                    ? fullPath.split(' / ').pop()!
                    : fullPath;
                const catId = await getOrCreateCategory(leafName);
                categoryRef = { _type: "reference", _ref: catId };
            }

            // 2. Handle Image (Upload if not exists or if modified in Odoo)
            type SanityProduct = { _id: string; odooId?: number; odooLastModified?: string; hasImage: boolean };
            let imageAssetId = null;
            const existingSp = sanityProductsMap.get(sanityId) as SanityProduct | undefined;
            const isNewOrModified = !existingSp || !existingSp.hasImage || existingSp.odooLastModified !== (product.write_date as string);
            
            if (product.image_1920 && isNewOrModified) {
                imageAssetId = await uploadOdooImage(product.image_1920, `product-${product.id}`);
            }

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
                odooLastModified: product.write_date,
            });

            if (categoryRef) patch.set({ categories: [categoryRef] });
            
            // Handle Brand
            if (product.brand_id && Array.isArray(product.brand_id)) {
                const brandId = await getOrCreateBrand(product.brand_id[1]);
                patch.set({ brand: { _type: "reference", _ref: brandId } });
            }

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
            if (errorDetails.length < 5) errorDetails.push({ name: product.name, error: err?.message || String(err) });
        }
    }
    return { synced, deleted, errors, total: odooProducts.length, errorDetails };
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

