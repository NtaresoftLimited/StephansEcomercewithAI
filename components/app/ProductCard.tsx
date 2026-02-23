"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Eye, Share2 } from "lucide-react";
import { toast } from "sonner";
import { cn, formatPrice } from "@/lib/utils";
import { useCartActions } from "@/lib/store/cart-store-provider";
import { useWishlistActions, useIsInWishlist } from "@/lib/store/wishlist-store-provider";

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
  const { addItem } = useCartActions();
  const { toggleItem } = useWishlistActions();
  const isInWishlist = useIsInWishlist(product._id);

  const images = product.images ?? [];
  const mainImageUrl = images[0]?.asset?.url;

  const stock = product.stock ?? 0;
  const isOutOfStock = false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product._id,
      name: product.name ?? "Product",
      price: product.price ?? 0,
      image: mainImageUrl ?? undefined,
    });
    toast.success("Added to cart");
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleItem({
        productId: product._id,
        name: product.name ?? "Product",
        price: product.price ?? 0,
        image: mainImageUrl ?? undefined,
        slug: product.slug ?? "",
    });
    if (added) {
        toast.success("Added to wishlist!");
    } else {
        toast.info("Removed from wishlist");
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Implement Quick View logic here if needed, or emit event
      toast.info("Quick View");
  };

  const handleShare = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const url = `${window.location.origin}/products/${product.slug}`;

      if (navigator.share) {
          try {
              await navigator.share({
                  title: product.name ?? "Product",
                  text: `Check out ${product.name} at Stephan's Pet Store!`,
                  url,
              });
          } catch {
              // User cancelled
          }
      } else {
          await navigator.clipboard.writeText(url);
          toast.success("Link copied to clipboard!");
      }
  };

  return (
    <div className="group relative flex flex-col">
      <Link href={`/products/${product.slug}`} className="block relative">
        {/* Image Container - Aspect Ratio 4:5 (1080x1350) */}
        <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          {mainImageUrl ? (
            <Image
              src={mainImageUrl}
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

          {/* Hover Action Buttons - Right Side (100% Similar to Featured Products) */}
          <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-20">
              <button
                  onClick={handleToggleWishlist}
                  className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-all hover:scale-110",
                      isInWishlist
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-white/95 text-zinc-600 hover:bg-white hover:text-red-500"
                  )}
                  aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                  <Heart className={cn("h-5 w-5", isInWishlist && "fill-current")} />
              </button>
              <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-zinc-600 shadow-md transition-all hover:bg-white hover:text-[#6b3e1e] hover:scale-110"
                  aria-label="Add to cart"
              >
                  <ShoppingCart className="h-5 w-5" />
              </button>
              <button
                  onClick={handleQuickView}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-zinc-600 shadow-md transition-all hover:bg-white hover:text-blue-500 hover:scale-110"
                  aria-label="Quick view"
              >
                  <Eye className="h-5 w-5" />
              </button>
              <button
                  onClick={handleShare}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-zinc-600 shadow-md transition-all hover:bg-white hover:text-green-500 hover:scale-110"
                  aria-label="Share"
              >
                  <Share2 className="h-5 w-5" />
              </button>
          </div>

          {/* Minimalist Badges */}
          {isOutOfStock && (
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded">
              <span className="text-[9px] font-bold uppercase tracking-wider text-red-600">Sold Out</span>
            </div>
          )}
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5 z-10" />
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
        </div>
      </div>
    </div>
  );
}
