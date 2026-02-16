"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import { useCartActions } from "@/lib/store/cart-store-provider";
import { StockBadge } from "@/components/app/StockBadge";

interface Product {
  _id: string;
  name: string | null;
  slug: string | null;
  price: number | null;
  stock: number | null;
  images: Array<{
    _key: string;
    asset: {
      url: string | null;
    } | null;
  }> | null;
  category: {
    title: string | null;
  } | null;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(null);
  const { addItem } = useCartActions();

  const images = product.images ?? [];
  const mainImageUrl = images[0]?.asset?.url;
  const displayedImageUrl =
    hoveredImageIndex !== null
      ? images[hoveredImageIndex]?.asset?.url
      : mainImageUrl;

  const stock = product.stock ?? 0;
  const isOutOfStock = false;
  const hasMultipleImages = images.length > 1;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    
    addItem({
      productId: product._id,
      name: product.name ?? "Product",
      price: product.price ?? 0,
      image: mainImageUrl ?? undefined,
    });
    toast.success("Added to cart");
  };

  return (
    <div className="group relative flex flex-col">
      <Link href={`/products/${product.slug}`} className="block relative">
        <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-transparent group-hover:border-zinc-200 dark:group-hover:border-zinc-700 transition-colors">
          {displayedImageUrl ? (
            <Image
              src={displayedImageUrl}
              alt={product.name ?? "Product image"}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground/40">
              <span className="text-xs font-medium uppercase tracking-widest">No Image</span>
            </div>
          )}

          {/* Quick Add Button - Minimalist Overlay */}
          <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 z-10">
            <button
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className="w-full h-10 bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-900 hover:text-white transition-colors text-xs font-bold tracking-widest uppercase shadow-sm"
            >
              {isOutOfStock ? "Out of Stock" : "Quick Add"}
            </button>
          </div>

          {/* Minimalist Badges */}
          {isOutOfStock && (
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-red-600">Sold Out</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Details - Clean Layout */}
      <div className="mt-4 flex flex-col gap-1">
        <Link href={`/products/${product.slug}`} className="group/title">
          <h3 className="text-sm font-medium text-foreground/90 group-hover/title:text-foreground transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground/70">
            {formatPrice(product.price)}
          </p>
          {/* Optional: Minimalist Stock Indicator if low stock */}
        </div>
      </div>

      {/* Thumbnail Interaction (Optional - can be removed for strict minimalism, but kept for function) */}
      {hasMultipleImages && (
        <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-1">
          {/* Using invisible hover zones or small dots could be cleaner, but for now just hiding standard thumbnails unless hovered */}
        </div>
      )}
    </div>
  );
}
