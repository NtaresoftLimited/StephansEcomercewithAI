import { sendWhatsAppMessage } from "@/lib/whatsapp";

/**
 * Generates a mock payment link (since we don't have a real Stripe secret key configured in this demo env)
 * In production, this would call Stripe API or Odoo API to get a real invoice URL.
 */
export async function generatePaymentLink(orderId: string, amount: number, currency: string = "TZS"): Promise<string> {
    // Mock Link - In reality, replace with:
    // const session = await stripe.checkout.sessions.create(...)
    // return session.url;
    
    // For now, we simulate a secure payment page route in our app
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://stephanspetstore.co.tz";
    return `${baseUrl}/checkout/pay/${orderId}?amt=${amount}`;
}

/**
 * Sends a Payment Link via WhatsApp
 */
export async function sendPaymentLinkToWhatsApp(
    phoneNumber: string, 
    orderId: string, 
    amount: number,
    customerName: string
) {
    const paymentLink = await generatePaymentLink(orderId, amount);
    
    const message = `
Hello ${customerName} 👋

Your order *#${orderId}* has been confirmed!

Total Amount: *${amount.toLocaleString()} TZS*

Please complete your secure payment by clicking the link below:
${paymentLink}

_This link is valid for 24 hours._
    `.trim();

    return await sendWhatsAppMessage(phoneNumber, message);
}

/**
 * Sends a Payment Receipt via WhatsApp
 */
export async function sendPaymentReceipt(
    phoneNumber: string,
    orderId: string,
    amount: number
) {
    const message = `
✅ *Payment Received!*

We have received your payment of *${amount.toLocaleString()} TZS* for order *#${orderId}*.

We will notify you when your order is out for delivery. Thank you for shopping with Stephan's Pet Store! 🐾
    `.trim();

    return await sendWhatsAppMessage(phoneNumber, message);
}
