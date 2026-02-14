import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

// Interface for UltraMsg Incoming Webhook Payload
interface UltraMsgWebhookPayload {
  data: {
    from: string; // Sender phone number (e.g., "1234567890@c.us")
    to: string;
    body: string; // Message content
    type: string; // "chat", "image", etc.
    time: number;
    id: string;
  };
  event_type: string; // "message_received"
  instanceId: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload: UltraMsgWebhookPayload = await req.json();

    // Verify it's a message_received event
    if (payload.event_type !== "message_received") {
      return NextResponse.json({ status: "ignored" });
    }

    const { from, body } = payload.data;
    const message = body.trim().toUpperCase();
    
    // Extract pure phone number (remove @c.us suffix)
    const phoneNumber = from.split("@")[0];

    console.log(`[WhatsApp Webhook] Received from ${phoneNumber}: ${message}`);

    // --- LOGIC ROUTER ---

    // 1. Verification Handler
    if (message === "VERIFY" || message === "YES") {
      // TODO: Call Odoo Verification Logic Here
      // await verifyOdooAction(phoneNumber);
      
      await sendWhatsAppMessage(
        phoneNumber, 
        "✅ Verification Successful! We have updated your status in our system."
      );
      return NextResponse.json({ status: "processed", action: "verify" });
    }

    // 2. Help/Status Handler
    if (message === "HELP" || message === "MENU") {
      const helpText = `
*Stephan's Pet Store Assistant* 🐾

Here are some commands you can use:
- *VERIFY*: Confirm a pending appointment or order.
- *STATUS*: Check your latest order status.
- *PAY*: Get a payment link for your pending order.
      `.trim();
      
      await sendWhatsAppMessage(phoneNumber, helpText);
      return NextResponse.json({ status: "processed", action: "help" });
    }

    // Default: Auto-reply for unknown messages
    // await sendWhatsAppMessage(phoneNumber, "Thanks for your message! A team member will be with you shortly.");

    return NextResponse.json({ status: "received" });

  } catch (error) {
    console.error("[WhatsApp Webhook] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
