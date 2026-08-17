import { NextResponse } from 'next/server';
import { odoo } from '@/lib/odoo/client';
import { wasenderClient } from '@/lib/wasender/client';

// Prevent caching to ensure fresh data on every run
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Verify Authorization (Vercel Cron Secret)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Allow testing without cron secret in development
      if (process.env.NODE_ENV !== 'development') {
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartStr = todayStart.toISOString().split('.')[0].replace('T', ' ');

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const todayEndStr = todayEnd.toISOString().split('.')[0].replace('T', ' ');

    console.log(`📊 Generating Daily Report for ${todayStartStr.split(' ')[0]}`);

    // 2. Fetch Sales Data (POS Orders for today)
    const posOrders = await odoo.searchRead(
      "pos.order",
      [
        ["date_order", ">=", todayStartStr],
        ["date_order", "<=", todayEndStr],
        ["state", "in", ["paid", "done", "invoiced"]]
      ],
      ["id", "name", "amount_total", "lines", "config_id"]
    );

    let totalSales = 0;
    posOrders.forEach(order => { totalSales += order.amount_total; });
    
    // We assume Grooming is identifiable either by a POS config or by product category.
    // For this generic plan, we'll try to find grooming from the lines, or assume standard sales.
    // Real implementation requires precise category ID mapping from Odoo.
    
    // 3. Reorder Levels (Top 5 urgent per warehouse)
    // Query orderpoints where stock is below minimum
    const orderpoints = await odoo.searchRead(
      "stock.warehouse.orderpoint",
      [],
      ["id", "product_id", "location_id", "product_min_qty", "product_max_qty", "qty_on_hand", "qty_to_order"],
      20
    );

    const urgentReorders = orderpoints
      .filter(op => op.qty_on_hand <= op.product_min_qty)
      .sort((a, b) => a.qty_on_hand - b.qty_on_hand)
      .slice(0, 5); // top 5

    // 4. Inventory Movements (In/Out today)
    const pickings = await odoo.searchRead(
      "stock.picking",
      [
        ["date_done", ">=", todayStartStr],
        ["date_done", "<=", todayEndStr],
        ["state", "=", "done"]
      ],
      ["id", "name", "picking_type_id", "state"]
    );

    let receipts = 0;
    let deliveries = 0;
    let internal = 0;

    pickings.forEach(p => {
      const typeName = p.picking_type_id[1] ? p.picking_type_id[1].toLowerCase() : '';
      if (typeName.includes('receipt') || typeName.includes('in')) receipts++;
      else if (typeName.includes('delivery') || typeName.includes('out')) deliveries++;
      else internal++;
    });

    // 5. Format the WhatsApp Message
    const reportDate = todayStart.toLocaleDateString();
    let message = `*Stephan's Pet Store - Daily Report* 📊\n_Date: ${reportDate}_\n\n`;

    message += `*🛒 Sales Summary*\n`;
    message += `• Total POS Orders: ${posOrders.length}\n`;
    message += `• Total Revenue: TZS ${totalSales.toLocaleString()}\n\n`;

    message += `*📦 Inventory Movements*\n`;
    message += `• Receipts (IN): ${receipts}\n`;
    message += `• Deliveries (OUT): ${deliveries}\n`;
    message += `• Internal Transfers: ${internal}\n\n`;

    message += `*⚠️ Urgent Reorders (Top 5)*\n`;
    if (urgentReorders.length > 0) {
      urgentReorders.forEach(item => {
        const prodName = item.product_id[1] || 'Unknown Product';
        message += `• ${prodName}: *${item.qty_on_hand}* (Min: ${item.product_min_qty})\n`;
      });
    } else {
      message += `• All stock levels look good! ✅\n`;
    }

    message += `\n_End of Report_`;

    // 6. Send the message
    const targetNumber = process.env.ADMIN_WHATSAPP_NUMBER || "1234567890"; // From Env

    // Wait for the send
    const wasenderResponse = await wasenderClient.sendMessage(targetNumber, message);

    return NextResponse.json({
      success: true,
      message: "Daily report generated and sent.",
      data: {
        totalSales,
        orders: posOrders.length,
        urgentReorders,
        pickings: { receipts, deliveries, internal }
      },
      wasenderResponse
    });
    
  } catch (error: any) {
    console.error("❌ Daily Report Error:", error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
