"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";
import { toast } from "sonner";
import { cn, formatPrice } from "@/lib/utils";
import { useCartActions } from "@/lib/store/cart-store-provider";
import { useWishlistActions, useIsInWishlist } from "@/lib/store/wishlist-store-provider";

interface Product {
  _id: string;
  name: string | null;
  slug: string | null;
  price: number | null;
  stock?: number | null;
  description?: string | null;
  images: Array<{
    _key: string;
    asset: {
      url: string | null;
    } | null;
  }> | null;
  categories?: Array<{
    _id: string;
    title: string | null;
    slug: string | null;
  }> | null;
  brand?: {
    name: string | null;
    slug: string | null;
  } | null;
}

interface ProductCardProps {
  product: Product;
}

const getOptimizedSanityUrl = (url: string | null, size = 400): string | null => {
  if (!url || !url.includes("cdn.sanity.io")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}w=${size}&h=${size}&fit=clip&q=75&auto=format`;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartActions();
  const { toggleItem } = useWishlistActions();
  const isInWishlist = useIsInWishlist(product._id);

  const images = product.images ?? [];
  const mainImageUrl = images[0]?.asset?.url;

  const stock = product.stock ?? 0;
  const isOutOfStock = stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) {
      toast.error("Item is currently out of stock");
      return;
    }
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

  return (
    <div className="text-card-foreground group relative overflow-hidden h-full bg-white border-0 rounded-2xl transition-all duration-300 flex flex-col hover:shadow-xl hover:-translate-y-0.5">
      {/* Wishlist Button */}
      <button 
        onClick={handleToggleWishlist}
        className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110" 
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart 
          className={cn(
            "h-4 w-4 transition-colors duration-200",
            isInWishlist ? "fill-[#E53935] text-[#E53935]" : "text-gray-400 hover:text-[#E53935]"
          )} 
        />
      </button>

      {/* Product Image */}
      <Link className="block relative" href={`/shop/${product.slug}`}>
        <div className="aspect-square w-full bg-white flex items-center justify-center overflow-hidden">
          <div className="relative w-full h-full p-4">
            {mainImageUrl ? (
              <Image 
                alt={product.name ?? "Product"} 
                src={getOptimizedSanityUrl(mainImageUrl) ?? mainImageUrl}
                fill
                className="object-contain transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 15vw"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-300">
                <span className="text-[10px] font-bold uppercase">No Image</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex-grow p-3 pt-3 flex flex-col">
        <Link className="block mb-1" href={`/shop/${product.slug}`}>
          <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 hover:text-[#6b3e1e] transition-colors duration-200 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-baseline gap-2 flex-wrap">
          <span className="text-base font-bold text-[#E53935]">
            {formatPrice(product.price, "Tsh")}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="items-center p-3 pt-0 flex gap-1.5">
        <div className="w-1/2">
          <button 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 px-3 w-full h-8 rounded-lg text-xs font-medium transition-all duration-200 bg-[#6b3e1e] hover:bg-[#5a3319] text-white"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-white" />
            <span>Shop</span>
          </button>
        </div>
        <div className="w-1/2">
          <Link 
            href={`/shop/${product.slug}`}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background hover:bg-accent w-full h-8 px-2 rounded-lg border border-gray-200 hover:border-[#6b3e1e] hover:text-[#6b3e1e] text-xs font-medium transition-all duration-200"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
