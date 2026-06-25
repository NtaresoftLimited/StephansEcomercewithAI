import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { generateOrderPDF } from "@/lib/pdf-generator";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ orderNumber: string }> }
) {
    const { orderNumber } = await params;

    try {
        // Fetch order from Sanity
        const order = await client.fetch(
            `*[_type == "order" && orderNumber == $orderNumber][0]`,
            { orderNumber }
        );

        if (!order || !order.orderDataJson) {
            return new NextResponse("Order not found", { status: 404 });
        }

        const orderData = JSON.parse(order.orderDataJson);

        // Generate PDF
        const pdfBuffer = await generateOrderPDF(orderData, orderNumber);

        // Return PDF
        return new NextResponse(new Uint8Array(pdfBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="Order-${orderNumber}.pdf"`,
            },
        });
    } catch (error) {
        console.error("Error generating receipt", error);
        return new NextResponse("Error generating receipt", { status: 500 });
    }
}
