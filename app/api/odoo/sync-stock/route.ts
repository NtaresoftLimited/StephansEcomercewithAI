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
 * Lightweight Stock & Price Sync from Odoo → Sanity
 * Only updates `stock` and `price` fields — no image re-uploads.
 *
 * GET  /api/odoo/sync-stock              — run in dev
 * GET  /api/odoo/sync-stock?secret=xxx   — run in prod (manual)
 * POST /api/odoo/sync-stock              — run via cron / webhook
 */

async function runStockSync() {
    console.log("📦 Starting lightweight Odoo → Sanity stock sync...");

    // 1. Fetch ALL Sanity products that have an odooId
    const sanityProducts: { _id: string; odooId: number; price: number; stock: number }[] =
        await sanityClient.fetch(
            `*[_type == "product" && defined(odooId)]{ _id, odooId, price, stock }`
        );

    if (sanityProducts.length === 0) {
        return { synced: 0, skipped: 0, hidden: 0, errors: 0, total: 0 };
    }

    // 2. Collect all Odoo template IDs
    const odooIds = sanityProducts.map((p) => p.odooId);

    // 3. Fetch current stock & price from Odoo in one call
    const odooData = await odoo.searchRead(
        "product.template",
        [["id", "in", odooIds]],
        ["id", "list_price", "qty_available"],
        500
    );

    // Build a lookup map: odooId → { price, stock }
    const odooMap = new Map<number, { price: number; stock: number }>();
    for (const item of odooData) {
        odooMap.set(item.id, {
            price: item.list_price ?? 0,
            stock: Math.max(0, Math.floor(item.qty_available ?? 0)),
        });
    }

    let synced = 0;
    let skipped = 0;
    let hidden = 0;
    let errors = 0;

    // 4. Batch-patch Sanity documents
    const transaction = sanityClient.transaction();

    for (const sp of sanityProducts) {
        try {
            const odooInfo = odooMap.get(sp.odooId);

            if (!odooInfo) {
                // Product no longer exists in Odoo — set stock to 0
                transaction.patch(sp._id, (patch) =>
                    patch.set({ stock: 0 })
                );
                hidden++;
                continue;
            }

            const newPrice = odooInfo.price;
            const newStock = odooInfo.stock;

            // Only patch if something actually changed
            if (sp.price !== newPrice || sp.stock !== newStock) {
                transaction.patch(sp._id, (patch) =>
                    patch.set({ price: newPrice, stock: newStock })
                );
                synced++;

                if (newPrice <= 0 || newStock <= 0) {
                    hidden++;
                }

                console.log(
                    `  ✅ ${sp._id}: price ${sp.price}→${newPrice}, stock ${sp.stock}→${newStock}`
                );
            } else {
                skipped++;
            }
        } catch (err) {
            console.error(`  ❌ Failed to patch ${sp._id}:`, err);
            errors++;
        }
    }

    // 5. Commit all patches in one transaction
    if (synced > 0 || hidden > 0) {
        await transaction.commit();
        console.log(`📦 Transaction committed.`);
    }

    const summary = {
        synced,
        skipped,
        hidden,
        errors,
        total: sanityProducts.length,
    };

    console.log("📦 Stock sync complete:", summary);
    return summary;
}

// ─── POST (cron / webhook) ───────────────────────────────
export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const result = await runStockSync();
        return NextResponse.json({
            success: true,
            ...result,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Stock sync failed", details: String(error) },
            { status: 500 }
        );
    }
}

// ─── GET (manual browser trigger) ────────────────────────
export async function GET(request: Request) {
    const url = new URL(request.url);
    const secret = url.searchParams.get("secret");
    const cronSecret = process.env.CRON_SECRET;

    const authorized =
        process.env.NODE_ENV !== "production" ||
        (cronSecret && secret === cronSecret);

    if (!authorized) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await runStockSync();
        return NextResponse.json({
            success: true,
            ...result,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Stock sync failed", details: String(error) },
            { status: 500 }
        );
    }
}
