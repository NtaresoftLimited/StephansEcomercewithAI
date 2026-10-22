"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { PackageOpen } from "lucide-react";
import { sanityImageUrl } from "@/lib/sanity-image";

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
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const images = product.images ?? [];
  const rawImageUrl = images[0]?.asset?.url;
  const mainImageUrl = sanityImageUrl(rawImageUrl, 480) ?? rawImageUrl;
  const productSlug = typeof product.slug === "string" ? product.slug : (product.slug as any)?.current || "";


  return (
    <div className="group relative h-full flex flex-col transition-all duration-300">
      <Link 
        href={productSlug ? `/shop/${productSlug}` : "#"}
        className="cursor-pointer block relative flex-grow flex flex-col"
      >
        {/* Product Image */}
        <div className="aspect-[4/5] sm:aspect-square w-full rounded-2xl bg-[#F4F1EA] flex items-center justify-center overflow-hidden p-6 md:p-8 mb-4">
          <div className="relative w-full h-full">
            {mainImageUrl && !imageError ? (
              <>
                {!isLoaded && (
                  <div className="absolute inset-0 rounded-xl bg-black/5 animate-pulse" />
                )}
                <Image 
                  alt={product.name ?? "Product"} 
                  src={mainImageUrl}
                  fill
                  priority={priority}
                  unoptimized
                  onLoad={() => setIsLoaded(true)}
                  className={cn(
                    "object-contain transition-all duration-500 group-hover:scale-105 mix-blend-multiply",
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
          <h3 className="text-sm font-semibold text-[#222222] leading-snug mb-1">
            {product.name}
          </h3>
          
          <div className="flex flex-col gap-0.5 mb-3">
            {product.brand?.name && (
              <p className="text-[10px] font-bold tracking-widest text-[#c77e35] uppercase">{product.brand.name}</p>
            )}
            {product.categories && product.categories.length > 0 && (
              <p className="text-[11px] text-zinc-500 line-clamp-1">
                {product.categories.map((c: any) => c?.title || c?.name).filter(Boolean).join(", ")}
              </p>
            )}
          </div>
          
          <div className="mt-auto pt-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#4E2A15]">
              {formatPrice(product.price, "Tsh")}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
