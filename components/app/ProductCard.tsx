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
    <div className="group relative overflow-hidden h-full bg-white rounded-2xl transition-all duration-300 flex flex-col hover:shadow-md border border-transparent hover:border-gray-100">
      <Link className="block relative flex-grow flex flex-col" href={`/shop/${product.slug}`}>
        {/* Product Image */}
        <div className="aspect-[4/3] w-full flex items-center justify-center overflow-hidden p-6 md:p-8">
          <div className="relative w-full h-full">
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
        
        {/* Product Details */}
        <div className="px-6 pb-6 flex flex-col flex-grow justify-end">
          <h3 className="text-[13px] sm:text-[15px] font-medium text-[#222222] leading-tight mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          <span className="text-[13px] sm:text-[14px] text-[#444444]">
            {formatPrice(product.price, "Tsh")}
          </span>
        </div>
      </Link>

      {/* Action Button: Shopping Bag icon on bottom right */}
      <button 
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className="absolute bottom-4 right-4 z-20 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 text-[#222222]"
        aria-label="Add to cart"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11M5 9H19L20 21H4L5 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
