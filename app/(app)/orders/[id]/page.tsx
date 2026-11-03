import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { ArrowLeft, CreditCard, MapPin, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { client } from "@/sanity/lib/client";
import { ORDER_BY_ID_QUERY } from "@/lib/sanity/queries/orders";
import { getOrderStatus } from "@/lib/constants/orderStatus";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  ReorderButton,
  type ReorderableItem,
} from "@/components/portal/ReorderButton";

export const metadata = {
  title: "Order Details | Stephan's Pet Store",
  description: "View your Stephan's Pet Store order details and invoice",
};

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderPageProps) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  const userPhone = session?.user?.phone;

  const order = await client.fetch(
    ORDER_BY_ID_QUERY,
    { id },
    { cache: "no-store" }
  ).catch(() => null);

  // Verify order exists and belongs to current user (by userId or verified phone)
  const belongsToUser =
    order &&
    (order.userId === userId ||
      (userPhone && order.phone && order.phone === userPhone));

  if (!belongsToUser) {
    notFound();
  }

  const status = getOrderStatus(order.status);
  const StatusIcon = status.icon;

  // Build normalized items list (supporting both Sanity product refs and Odoo cart items)
  const displayItems: Array<{
    key: string;
    productId: string;
    name: string;
    slug?: string;
    quantity: number;
    price: number;
    image?: string;
  }> = [];

  if (order.orderDataJson) {
    try {
      const parsed = JSON.parse(order.orderDataJson);
      if (Array.isArray(parsed?.items) && parsed.items.length > 0) {
        parsed.items.forEach((item: any, idx: number) => {
          const productId = item.productId || item._id || "";
          displayItems.push({
            key: `json-${idx}`,
            productId,
            name: item.name || item.productName || "Pet Store Item",
            slug: productId,
            quantity: Math.max(1, Number(item.quantity) || 1),
            price: Number(item.price ?? item.priceAtPurchase ?? 0),
            image:
              item.image ||
              (productId.startsWith("odoo-")
                ? `https://erp.stephanspetstore.co.tz/web/image/product.template/${productId.replace("odoo-", "")}/image_1920`
                : undefined),
          });
        });
      }
    } catch {
      // Fall back to order.items
    }
  }

  if (displayItems.length === 0 && Array.isArray(order.items)) {
    for (const item of order.items as any[]) {
      const productId = item.product?._id || item.productRef || "";
      displayItems.push({
        key: item._key,
        productId,
        name:
          item.product?.name || item.productName || "Stephan's Pet Store Item",
        slug: item.product?.slug || productId,
        quantity: Math.max(1, Number(item.quantity) || 1),
        price: Number(item.priceAtPurchase ?? 0),
        image:
          item.product?.image?.asset?.url ||
          (productId.startsWith("odoo-")
            ? `https://erp.stephanspetstore.co.tz/web/image/product.template/${productId.replace("odoo-", "")}/image_1920`
            : undefined),
      });
    }
  }

  const reorderItems: ReorderableItem[] = displayItems.map((i) => ({
    productId: i.productId,
    name: i.name,
    price: i.price,
    quantity: i.quantity,
    image: i.image,
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/orders"
          className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-[#3e220f] dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customer Portal
        </Link>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3e220f] dark:text-zinc-100">
              Order {order.orderNumber}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Placed on {formatDate(order.createdAt, "datetime")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge className={`${status.color} flex items-center gap-1.5`}>
              <StatusIcon className="h-4 w-4" />
              {status.label}
            </Badge>
            <ReorderButton
              items={reorderItems}
              orderLabel={`Order #${order.orderNumber}`}
              variant="primary"
              size="md"
            />
            {order.orderNumber && (
              <a
                href={`/receipt/${order.orderNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-bold text-zinc-700 hover:border-[#c77e35] hover:text-[#3e220f]"
              >
                <Download className="h-3.5 w-3.5" />
                PDF Invoice
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Order Items */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Items ({displayItems.length})
              </h2>
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {displayItems.map((item) => (
                <div key={item.key} className="flex gap-4 px-6 py-4">
                  {/* Image */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50 dark:bg-zinc-800">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-1.5"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      {item.slug ? (
                        <Link
                          href={`/shop/${item.slug}`}
                          className="font-semibold text-zinc-900 hover:text-[#c77e35] dark:text-zinc-100"
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {item.name}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-zinc-500">
                        {formatPrice(item.price)} each
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary & Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Summary */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Order Summary
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Subtotal
                </span>
                <span className="text-zinc-900 dark:text-zinc-100">
                  {formatPrice(order.total)}
                </span>
              </div>
              <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <div className="flex justify-between font-semibold">
                  <span className="text-zinc-900 dark:text-zinc-100">
                    Total
                  </span>
                  <span className="text-[#c77e35]">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.address && (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#c77e35]" />
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Delivery Details
                </h2>
              </div>
              <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                {order.address.name && (
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {order.address.name}
                  </p>
                )}
                {order.address.line1 && <p>{order.address.line1}</p>}
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>
                  {[order.address.city, order.address.postcode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {order.address.country && <p>{order.address.country}</p>}
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#c77e35]" />
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Order & Payment Info
              </h2>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-light tracking-wide">Status</span>
                <span className="text-sm font-medium capitalize text-emerald-600">
                  {order.status}
                </span>
              </div>
              {order.phone && (
                <div className="flex items-center justify-between">
                  <p className="text-xs font-light tracking-wide">Phone</p>
                  <p className="font-mono text-sm text-zinc-900 dark:text-zinc-100">
                    {order.phone}
                  </p>
                </div>
              )}
              {order.email && (
                <div className="flex items-center justify-between">
                  <p className="text-xs font-light tracking-wide">Email</p>
                  <p className="min-w-0 truncate text-sm text-zinc-900 dark:text-zinc-100">
                    {order.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
