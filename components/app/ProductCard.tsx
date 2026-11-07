"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { PackageOpen, Heart, ShoppingBag } from "lucide-react";
import { sanityImageUrl } from "@/lib/sanity-image";
import { useCartActions } from "@/lib/store/cart-store-provider";

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
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCartActions();
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const images = product.images ?? [];
  const rawImageUrl = images[0]?.asset?.url;
  const mainImageUrl = sanityImageUrl(rawImageUrl, 480) ?? rawImageUrl;
  const productSlug = typeof product.slug === "string" ? product.slug : (product.slug as any)?.current || "";

  const handleAddToCart = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    addItem({
      productId: product._id,
      name: product.name || "Product",
      price: Number(product.price) || 0,
      image: mainImageUrl || undefined,
    });
  };

  return (
    <div className="group relative h-full flex flex-col rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700 shadow-none">
      {/* Wishlist action */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none">
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
          <div className="mt-auto pt-2 pr-12 flex items-baseline gap-2">
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              {formatPrice(product.price, "Tsh")}
            </span>
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={handleAddToCart}
        aria-label={`Add ${product.name || "product"} to bag`}
        title="Add to bag"
        className="absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#4e2a15] text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#65391f] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c77e35] focus-visible:ring-offset-2 active:translate-y-0"
      >
        <ShoppingBag className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
      </button>
    </div>
  );
}
