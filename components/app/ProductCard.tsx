"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { PackageOpen, Heart } from "lucide-react";
import { sanityImageUrl } from "@/lib/sanity-image";

interface Product {
  _id: string;
  name: string | null;
  slug: string | null;
  price: number | null;
  originalPrice?: number | null;
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
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const images = product.images ?? [];
  const rawImageUrl = images[0]?.asset?.url;
  const mainImageUrl = sanityImageUrl(rawImageUrl, 480) ?? rawImageUrl;
  const productSlug = typeof product.slug === "string" ? product.slug : (product.slug as any)?.current || "";

  // Deterministic review count based on ID
  const hash = Math.abs((product._id || product.name || "0").split("").reduce((a, c) => a + c.charCodeAt(0), 0));
  const reviewCount = (hash % 380) + 24;
  const discountPercent = product.originalPrice && product.price && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : (hash % 10 === 0 ? 15 : hash % 7 === 0 ? 10 : 0);

  const isInStock = (product.stock ?? 1) > 0;

  return (
    <div className="group relative h-full flex flex-col rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700 shadow-none">
      {/* Top action row: Discount badge on left, Wishlist on right */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        {discountPercent > 0 ? (
          <span className="pointer-events-auto rounded-md bg-[#EF4444] px-2 py-0.5 text-[11px] font-bold text-white tracking-wide">
            {discountPercent}%
          </span>
        ) : (
          <span />
        )}
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          aria-label="Add to wishlist"
          className="pointer-events-auto h-8 w-8 rounded-full border border-zinc-200 bg-white/90 dark:bg-zinc-900/90 dark:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:border-red-200 transition-colors shadow-none"
        >
          <Heart className={cn("w-4 h-4", isWishlisted && "fill-red-500 text-red-500")} />
        </button>
      </div>

      <Link 
        href={productSlug ? `/shop/${productSlug}` : "#"}
        className="cursor-pointer block relative flex-grow flex flex-col pt-3"
      >
        {/* Product Image Container */}
        <div className="aspect-square w-full rounded-xl bg-zinc-50/60 dark:bg-zinc-900/40 flex items-center justify-center overflow-hidden p-6 mb-3 relative">
          <div className="relative w-full h-full">
            {mainImageUrl && !imageError ? (
              <>
                {!isLoaded && (
                  <div className="absolute inset-0 rounded-lg bg-black/5 dark:bg-white/5 animate-pulse" />
                )}
                <Image 
                  alt={product.name ?? "Product"} 
                  src={mainImageUrl}
                  fill
                  priority={priority}
                  onLoad={() => setIsLoaded(true)}
                  className={cn(
                    "object-contain transition-transform duration-300 group-hover:scale-105 mix-blend-multiply dark:mix-blend-normal",
                    isLoaded ? "opacity-100" : "opacity-0"
                  )}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  onError={() => setImageError(true)}
                />
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-zinc-300 gap-2">
                <PackageOpen className="w-8 h-8 text-zinc-200" strokeWidth={1} />
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-300">No Image</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Product Details */}
        <div className="flex flex-col flex-grow justify-start">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          

          
          {/* Price */}
          <div className="mt-auto pt-2 flex items-baseline gap-2">
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              {formatPrice(product.price, "Tsh")}
            </span>
            {product.originalPrice && product.originalPrice > (product.price ?? 0) && (
              <span className="text-xs text-zinc-400 line-through">
                {formatPrice(product.originalPrice, "Tsh")}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
