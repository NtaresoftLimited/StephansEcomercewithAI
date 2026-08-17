import { NextResponse } from 'next/server';
import { odoo } from '@/lib/odoo/client';
import { wasenderClient } from '@/lib/wasender/client';

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // 1. Verify Payload structure from Odoo Automated Action
    const posOrderId = payload.pos_order_id || payload.id;
    const customerPhone = payload.customer_phone || payload.phone;

    if (!posOrderId) {
      return new NextResponse('Missing pos_order_id in payload', { status: 400 });
    }

    if (!customerPhone) {
      console.warn(`⚠️ POS Order ${posOrderId} missing customer phone. Skipping WhatsApp receipt.`);
      return NextResponse.json({ success: false, message: 'No phone number provided' });
    }

    console.log(`🧾 Processing POS Receipt for Order ${posOrderId}`);

    // 2. Fetch POS Order Details from Odoo
    const [order] = await odoo.searchRead(
      "pos.order",
      [["id", "=", posOrderId]],
      ["id", "name", "date_order", "amount_total", "amount_tax", "amount_paid", "lines", "partner_id"],
      1
    );

    if (!order) {
      return new NextResponse('POS Order not found', { status: 404 });
    }

    // Fetch order lines
    const lines = await odoo.searchRead(
      "pos.order.line",
      [["id", "in", order.lines]],
      ["id", "full_product_name", "qty", "price_unit", "price_subtotal", "price_subtotal_incl"]
    );

    // 3. Format Receipt
    // Note: To generate an actual Image, we would use an external API like htmlcsstoimage.com
    // or @vercel/og here. For this implementation, we construct a highly formatted WhatsApp text message 
    // which functions as a digital receipt.
    
    let receiptText = `*Stephan's Pet Store*\n`;
    receiptText += `_Receipt for your recent purchase_\n`;
    receiptText += `--------------------------------\n`;
    receiptText += `*Order:* ${order.name}\n`;
    receiptText += `*Date:* ${new Date(order.date_order).toLocaleString()}\n`;
    receiptText += `--------------------------------\n`;
    
    lines.forEach(line => {
      receiptText += `${line.qty}x ${line.full_product_name}\n`;
      receiptText += `   @ ${line.price_unit.toLocaleString()}  ->  TZS ${line.price_subtotal_incl.toLocaleString()}\n`;
    });

    receiptText += `--------------------------------\n`;
    receiptText += `*Subtotal:* TZS ${(order.amount_total - order.amount_tax).toLocaleString()}\n`;
    receiptText += `*Tax:* TZS ${order.amount_tax.toLocaleString()}\n`;
    receiptText += `*TOTAL:* TZS ${order.amount_total.toLocaleString()}\n`;
    receiptText += `--------------------------------\n`;
    receiptText += `Thank you for shopping with us! 🐾\n`;

    // 4. Send via WasenderAPI
    // Note: ensure the customerPhone is in international format without '+' (e.g., '255712345678')
    const formattedPhone = customerPhone.replace(/\D/g, ''); 

    const wasenderResponse = await wasenderClient.sendMessage(formattedPhone, receiptText);

    return NextResponse.json({
      success: true,
      message: 'Receipt sent successfully',
      wasenderResponse
    });

  } catch (error: any) {
    console.error("❌ POS Receipt Webhook Error:", error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
