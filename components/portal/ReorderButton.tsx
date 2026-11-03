"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useCartActions } from "@/lib/store/cart-store-provider";

export interface ReorderableItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ReorderButtonProps {
  items: ReorderableItem[];
  orderLabel?: string;
  redirectToCheckout?: boolean;
  variant?: "outline" | "primary";
  size?: "sm" | "md";
}

export function ReorderButton({
  items,
  orderLabel,
  redirectToCheckout = false,
  variant = "outline",
  size = "sm",
}: ReorderButtonProps) {
  const { addItem, openCart } = useCartActions();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleReorder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status === "loading") return;

    const validItems = items.filter((item) => item.name && item.price >= 0);
    if (validItems.length === 0) {
      toast.warning("No reorderable items found in this order.");
      return;
    }

    setStatus("loading");

    let addedCount = 0;
    for (const item of validItems) {
      const qty = Math.max(1, Number(item.quantity) || 1);
      const fallbackId = `reorder-${item.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}`;
      const productId = item.productId || fallbackId;
      const resolvedImage =
        item.image ||
        (productId.startsWith("odoo-")
          ? `https://erp.stephanspetstore.co.tz/web/image/product.template/${productId.replace("odoo-", "")}/image_1920`
          : undefined);

      addItem(
        {
          productId,
          name: item.name,
          price: Number(item.price) || 0,
          image: resolvedImage,
        },
        qty
      );
      addedCount += qty;
    }

    setStatus("done");
    toast.success(
      `${addedCount} item${addedCount > 1 ? "s" : ""} from ${orderLabel || "your past order"} added to cart!`
    );

    setTimeout(() => {
      setStatus("idle");
      if (redirectToCheckout) {
        router.push("/checkout");
      } else {
        openCart();
      }
    }, 300);
  };

  const baseStyles =
    size === "md"
      ? "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
      : "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer";

  const variantStyles =
    variant === "primary"
      ? "bg-[#3e220f] text-white hover:bg-[#2a170a]"
      : "border border-zinc-200/80 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200";

  return (
    <button
      type="button"
      onClick={handleReorder}
      disabled={status === "loading" || items.length === 0}
      className={`${baseStyles} ${variantStyles}`}
    >
      {status === "loading" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-500" />
      ) : status === "done" ? (
        <Check className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <RotateCcw className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-300" />
      )}
      <span>{status === "done" ? "Added to Cart" : "Reorder"}</span>
    </button>
  );
}
