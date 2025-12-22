import { NextResponse } from "next/server";
import { odoo } from "@/lib/odoo/client";

/**
 * API endpoint to fetch product details with variants and images from Odoo
 * GET /api/odoo/products?id={templateId}
 * GET /api/odoo/products - List all products
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const templateId = searchParams.get("id");

        if (templateId) {
            // Fetch specific product with full details
            const productData = await odoo.getProductWithDetails(parseInt(templateId, 10));

            return NextResponse.json({
                success: true,
                data: productData,
            });
        }

        // List all products (templates)
        const products = await odoo.searchRead(
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
                "product_variant_count"
            ],
            100
        );

        return NextResponse.json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        console.error("Odoo products fetch error:", error);
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}

/**
 * POST /api/odoo/products - Create or update a product in Odoo
 * Body: { name, price, description, stock, variants? }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, price, description, stock, odooId } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, error: "Product name is required" },
                { status: 400 }
            );
        }

        if (odooId) {
            // Update existing product
            await odoo.executeKw(
                "product.template",
                "write",
                [[odooId], {
                    name,
                    list_price: price || 0,
                    description_sale: description || "",
                }]
            );

            return NextResponse.json({
                success: true,
                message: "Product updated",
                odooId,
            });
        } else {
            // Create new product
            const newId = await odoo.executeKw(
                "product.template",
                "create",
                [{
                    name,
                    list_price: price || 0,
                    description_sale: description || "",
                    sale_ok: true,
                    purchase_ok: true,
                }]
            );

            return NextResponse.json({
                success: true,
                message: "Product created",
                odooId: newId,
            });
        }
    } catch (error) {
        console.error("Odoo product create/update error:", error);
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}
