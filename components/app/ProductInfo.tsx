"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Star, RefreshCw, Info } from "lucide-react";
import { AddToCartButton } from "@/components/app/AddToCartButton";
import { AskAISimilarButton } from "@/components/app/AskAISimilarButton";
import { StockBadge } from "@/components/app/StockBadge";
import { formatPrice, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ProductInfoProps {
  product: any;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants?.[0]?._key || null
  );

  // Purchase type state (mock for UI)
  const [purchaseType, setPurchaseType] = useState<"onetime" | "subscribe">("onetime");

  const variants = product.variants || [];
  const selectedVariant = variants.find((v: any) => v._key === selectedVariantId) || null;

  // Determine current price and stock based on selection
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const imageUrl = product.images?.[0]?.asset?.url;

  // Mock Flavors if none exist (to satisfy UI requirement)
  const flavors = product.material ? [product.material] : ["Original Recipe"];
  const [selectedFlavor, setSelectedFlavor] = useState(flavors[0]);

  return (
    <div className="flex flex-col animate-in fade-in w-full">
      {/* Header Section */}
      <div className="mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-6">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4 font-sans uppercase">
          {product.name}
        </h1>

        <div className="flex items-center justify-between">
          {/* Mock Reviews */}
          <div className="flex items-center gap-2">
            <div className="flex text-zinc-900 dark:text-zinc-100">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-sm font-medium text-zinc-500 underline-offset-4 hover:underline cursor-pointer">
              128 Reviews
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {formatPrice(currentPrice)}
            </span>
            {selectedVariant?.compareAtPrice && (
              <span className="text-base text-zinc-400 line-through">
                {formatPrice(selectedVariant.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* New Customer Offer - Highlighted */}
      <div className="mb-8 bg-[#F4F1ED] dark:bg-zinc-800/50 p-4 rounded-md flex items-start gap-3 border border-[#E5E0D8] dark:border-zinc-700">
        <div className="shrink-0 mt-0.5">
          <Info className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase mb-1">
            New Customer Offer
          </p>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Get <span className="font-bold">20% OFF</span> your first order with code <span className="font-bold border-b border-zinc-900 border-dashed">NEW20</span>
          </p>
        </div>
      </div>

      {/* Select Flavor Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
            SELECT A FLAVOR
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {flavors.map((flavor: string) => (
            <button
              key={flavor}
              onClick={() => setSelectedFlavor(flavor)}
              className={cn(
                "px-6 py-3 border text-sm font-bold uppercase transition-all duration-200 min-w-[100px]",
                selectedFlavor === flavor
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-300 text-zinc-600 hover:border-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-100"
              )}
            >
              {flavor}
            </button>
          ))}
        </div>
      </div>

      {/* Select Size Section */}
      {variants.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
              SELECT SIZE
            </span>
            <span className="text-xs font-bold text-zinc-500 cursor-pointer underline underline-offset-2 hover:text-zinc-900">SIZE GUIDE</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant: any) => (
              <button
                key={variant._key}
                onClick={() => setSelectedVariantId(variant._key)}
                className={cn(
                  "relative px-6 py-3 border text-sm font-bold uppercase transition-all duration-200 min-w-[80px]",
                  selectedVariantId === variant._key
                    ? "border-zinc-900 bg-white text-zinc-900 ring-1 ring-zinc-900 dark:border-zinc-100 dark:bg-zinc-900 dark:text-zinc-100"
                    : "border-zinc-300 text-zinc-600 hover:border-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-100"
                )}
              >
                {variant.weight || variant.name}
                {variant.stock <= 0 && (
                  <span className="absolute -top-2 -right-2 bg-zinc-100 text-zinc-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-zinc-200">
                    SOLD OUT
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Purchase Options */}
      <div className="mb-8 space-y-3">
        {/* Mocked Subscribe/One-time logic - aligned with Open Farm style (clean rows) */}
        <div
          onClick={() => setPurchaseType("onetime")}
          className={cn(
            "relative p-4 border cursor-pointer transition-all flex items-center justify-between group",
            purchaseType === "onetime"
              ? "border-zinc-900 shadow-sm dark:border-zinc-100"
              : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
              purchaseType === "onetime" ? "border-zinc-900 bg-zinc-900 dark:border-zinc-100 dark:bg-zinc-100" : "border-zinc-300"
            )}>
              <div className="w-2 h-2 rounded-full bg-white dark:bg-zinc-900" />
            </div>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm uppercase tracking-wide">One-Time Purchase</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 block">{formatPrice(currentPrice)}</span>
          </div>
        </div>

        <div
          onClick={() => setPurchaseType("subscribe")}
          className={cn(
            "relative p-4 border cursor-pointer transition-all flex items-center justify-between group bg-zinc-50 dark:bg-zinc-900/50",
            purchaseType === "subscribe"
              ? "border-zinc-900 shadow-sm dark:border-zinc-100"
              : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
              purchaseType === "subscribe" ? "border-zinc-900 bg-zinc-900 dark:border-zinc-100 dark:bg-zinc-100" : "border-zinc-300"
            )}>
              <div className="w-2 h-2 rounded-full bg-white dark:bg-zinc-900" />
            </div>
            <div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm uppercase tracking-wide flex items-center gap-2">
                Subscribe & Save
                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">5% OFF</span>
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 block">{formatPrice(currentPrice * 0.95)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 mb-8">
        <AddToCartButton
          productId={product._id}
          name={product.name ?? "Unknown Product"}
          price={currentPrice}
          image={imageUrl ?? undefined}
          stock={currentStock ?? 0}
          className="h-14 w-full text-sm font-bold tracking-widest uppercase bg-[#D35122] text-white hover:bg-[#B54218] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-none shadow-sm transition-all"
        />
      </div>

      {/* Description */}
      <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400 leading-7">
        <p>{product.description}</p>
      </div>

      {/* Specs */}
      <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-bold uppercase tracking-wide mb-4 text-zinc-900 dark:text-zinc-100">Details</h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          {product.material && (
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2">
              <dt className="font-medium text-zinc-900 dark:text-zinc-100 text-xs uppercase">Ingredients / Material</dt>
              <dd className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 capitalize">{product.material}</dd>
            </div>
          )}
          {product.dimensions && (
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2">
              <dt className="font-medium text-zinc-900 dark:text-zinc-100 text-xs uppercase">Dimensions</dt>
              <dd className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{product.dimensions}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
