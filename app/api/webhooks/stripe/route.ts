import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { client, writeClient } from "@/sanity/lib/client";
import { ORDER_BY_STRIPE_PAYMENT_ID_QUERY } from "@/lib/sanity/queries/orders";
import { pushOrderToOdoo, getOdooProductId } from "@/lib/odoo/order-sync";

// Initialize Stripe lazily to avoid build-time errors
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not defined");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-12-15.clover" as any,
  });
}

function getWebhookSecret() {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not defined");
  }
  return process.env.STRIPE_WEBHOOK_SECRET;
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, getWebhookSecret());
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const stripePaymentId = session.payment_intent as string;

  try {
    // Idempotency check: prevent duplicate processing on webhook retries
    const existingOrder = await client.fetch(ORDER_BY_STRIPE_PAYMENT_ID_QUERY, {
      stripePaymentId,
    });

    if (existingOrder) {
      console.log(
        `Webhook already processed for payment ${stripePaymentId}, skipping`
      );
      return;
    }

    // Extract metadata
    const {
      clerkUserId,
      userEmail,
      sanityCustomerId,
      productIds: productIdsString,
      quantities: quantitiesString,
    } = session.metadata ?? {};

    if (!clerkUserId || !productIdsString || !quantitiesString) {
      console.error("Missing metadata in checkout session");
      return;
    }

    const productIds = productIdsString.split(",");
    const quantities = quantitiesString.split(",").map(Number);

    // Get line items from Stripe
    const lineItems = await getStripe().checkout.sessions.listLineItems(session.id);

    // Build order items array
    const orderItems = productIds.map((productId, index) => ({
      _key: `item-${index}`,
      product: {
        _type: "reference" as const,
        _ref: productId,
      },
      quantity: quantities[index],
      priceAtPurchase: lineItems.data[index]?.amount_total
        ? lineItems.data[index].amount_total / 100
        : 0,
    }));

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Extract shipping address
    const shippingAddress = session.customer_details?.address;
    const address = shippingAddress
      ? {
        name: session.customer_details?.name ?? "",
        line1: shippingAddress.line1 ?? "",
        line2: shippingAddress.line2 ?? "",
        city: shippingAddress.city ?? "",
        postcode: shippingAddress.postal_code ?? "",
        country: shippingAddress.country ?? "",
      }
      : undefined;

    // Create order in Sanity with customer reference
    const order = await writeClient.create({
      _type: "order",
      orderNumber,
      ...(sanityCustomerId && {
        customer: {
          _type: "reference",
          _ref: sanityCustomerId,
        },
      }),
      clerkUserId,
      email: userEmail ?? session.customer_details?.email ?? "",
      items: orderItems,
      total: (session.amount_total ?? 0) / 100,
      status: "paid",
      stripePaymentId,
      address,
      createdAt: new Date().toISOString(),
    });

    console.log(`Order created: ${order._id} (${orderNumber})`);

    // Decrease stock for all products in a single transaction
    await productIds
      .reduce(
        (tx, productId, i) =>
          tx.patch(productId, (p) => p.dec({ stock: quantities[i] })),
        writeClient.transaction()
      )
      .commit();

    console.log(`Stock updated for ${productIds.length} products`);

    // Push order to Odoo ERP (async, don't block webhook)
    try {
      const odooOrderLines = await Promise.all(
        productIds.map(async (productId, i) => {
          const odooProductId = await getOdooProductId(productId);
          return {
            productName: lineItems.data[i]?.description || "Product",
            productId: odooProductId || 0,
            quantity: quantities[i],
            price: (lineItems.data[i]?.amount_total || 0) / 100 / quantities[i],
          };
        })
      );

      // Only push if we have valid Odoo product IDs
      const validLines = odooOrderLines.filter(line => line.productId > 0);
      if (validLines.length > 0) {
        await pushOrderToOdoo({
          orderId: orderNumber,
          customer: {
            name: session.customer_details?.name || "Website Customer",
            email: session.customer_details?.email || userEmail || "",
            phone: session.customer_details?.phone || undefined,
          },
          lines: validLines,
          total: (session.amount_total ?? 0) / 100,
        });
        console.log(`Order pushed to Odoo ERP`);
      }
    } catch (odooError) {
      // Log but don't fail - Odoo sync is not critical for order completion
      console.error("Odoo sync failed (non-blocking):", odooError);
    }
  } catch (error) {
    console.error("Error handling checkout.session.completed:", error);
    throw error; // Re-throw to return 500 and trigger Stripe retry
  }
}
