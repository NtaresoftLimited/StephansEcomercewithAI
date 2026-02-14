import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface WhatsAppMessage {
    to: string;
    body: string;
}

export async function POST(request: NextRequest) {
    try {
        const { to, body }: WhatsAppMessage = await request.json();

        if (!to || !body) {
            return NextResponse.json(
                { success: false, error: "Missing required fields: to, body" },
                { status: 400 }
            );
        }

        const result = await sendWhatsAppMessage(to, body);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: "Failed to send WhatsApp message", details: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "WhatsApp message sent successfully",
            data: result.data,
        });
    } catch (error) {
        console.error("WhatsApp send error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
