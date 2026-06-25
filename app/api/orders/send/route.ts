import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/client";
import { generateOrderPDF } from "@/lib/pdf-generator";

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    _id?: string;
    productId?: string; // Cart store uses productId
}

interface OrderData {
    customer: {
        firstName: string;
        lastName: string;
        phone: string;
        email?: string;
        address?: string;
        city?: string;
        region?: string;
    };
    items: OrderItem[];
    total: number;
}

function generateOrderNumber(): string {
    const now = new Date();
    const y = now.getFullYear().toString().slice(-2);
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const r = Math.floor(1000 + Math.random() * 9000);
    return `SPS-${y}${m}${d}-${r}`;
}

export async function POST(request: Request) {
    console.log("📝 Received new order request");
    try {
        const body: OrderData = await request.json();

        if (!body.customer?.firstName || !body.customer?.phone || !body.items?.length) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const orderNumber = generateOrderNumber();
        console.log(`🎫 Order number: ${orderNumber}`);

        // 1. Save to Sanity
        console.log("💾 Saving to Sanity...");
        const sanityOrder = await writeClient.create({
            _type: "order",
            orderNumber,
            orderDate: new Date().toISOString(),
            status: "pending",
            total: body.total,
            email: body.customer.email || "customer@example.com",
            userId: "guest",
            customerName: `${body.customer.firstName} ${body.customer.lastName}`,
            phone: body.customer.phone,
            address: {
                name: `${body.customer.firstName} ${body.customer.lastName}`,
                line1: body.customer.address || "",
                city: body.customer.city || "",
                postcode: body.customer.region || "",
                country: "Tanzania",
            },
            items: body.items.map((item) => {
                const productRef = item._id || item.productId;
                return {
                    _key: Math.random().toString(36).substring(2, 9),
                    ...(productRef ? {
                        product: {
                            _type: "reference",
                            _ref: productRef,
                        },
                    } : {}),
                    productName: item.name,
                    quantity: item.quantity,
                    priceAtPurchase: item.price,
                };
            }),
            // We'll store the full order data as a JSON string to easily reconstruct the PDF later
            orderDataJson: JSON.stringify(body),
        });

        console.log(`✅ Order saved to Sanity: ${sanityOrder._id}`);

        return NextResponse.json({
            success: true,
            orderNumber,
        });
    } catch (error) {
        console.error("❌ Order processing error:", error);
        return NextResponse.json({ error: "Failed to process order", details: String(error) }, { status: 500 });
    }
}
