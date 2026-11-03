"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { 
  RefreshCw, 
  Heart, 
  Share2, 
  Copy, 
  Minus, 
  Plus 
} from "lucide-react";
import { AddToCartButton } from "@/components/app/AddToCartButton";
import { formatPrice, cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProductInfoProps {
  product: any;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants?.[0]?._key || null
  );

  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [mounted, setMounted] = useState(false);
  const purchaseBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "-100px 0px 0px 0px",
      }
    );

    if (purchaseBoxRef.current) {
      observer.observe(purchaseBoxRef.current);
    }

    return () => {
      if (purchaseBoxRef.current) {
        observer.unobserve(purchaseBoxRef.current);
      }
    };
  }, []);

  const variants = product.variants || [];
  const selectedVariant = variants.find((v: any) => v._key === selectedVariantId) || null;

  // Determine current price based on selection
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : (product.stock ?? 10);
  const imageUrl = product.images?.[0]?.asset?.url || (typeof product.images?.[0] === "string" ? product.images?.[0] : product.images?.[0]?.url);
  const brandName = product.brand?.name || "Stephan's";
  const brandSlug = product.brand?.slug?.current || product.brand?.slug || "";
  const sku = product.sku || product._id?.slice(-8).toUpperCase() || "H370BIT";

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleCopySku = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(sku);
      toast.success("SKU copied to clipboard!");
    }
  };

  return (
    <div className="flex flex-col w-full text-left">
      {/* 1. Top Utility Actions: Compare, Wishlist, Share */}
      <div className="flex items-center justify-end gap-5 mb-4 text-xs font-normal text-zinc-500 dark:text-zinc-400">
        <button
          type="button"
          onClick={() => toast.success("Added to compare list")}
          className="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Compare</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsWishlisted(!isWishlisted);
            toast.success(isWishlisted ? "Removed from Wishlist" : "Added to Wishlist");
          }}
          className="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          <Heart className={cn("w-3.5 h-3.5", isWishlisted && "fill-red-500 text-red-500")} />
          <span>Wishlist</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      </div>

      {/* 2. Product Name */}
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2 leading-snug">
        {product.name}
      </h1>

      {/* 3. Brand Row */}
      <div className="flex items-center gap-2 mb-2 text-sm">
        <span className="text-zinc-900 dark:text-zinc-100 font-normal">Brand</span>
        {brandSlug ? (
          <Link
            href={`/brands/${brandSlug}`}
            className="font-semibold text-[#8B1D42] hover:underline"
          >
            {brandName}
          </Link>
        ) : (
          <span className="font-semibold text-[#8B1D42]">
            {brandName}
          </span>
        )}
      </div>

      {/* 4. Rating & SKU Row */}
      <div className="flex items-center justify-between gap-4 mb-6 text-sm">
        <div className="flex items-center gap-1">
          <div className="flex text-zinc-300 text-sm">☆☆☆☆☆</div>
          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">0</span>
          <span className="text-zinc-400 text-sm">/5.0</span>
          <span className="text-zinc-400 text-xs ml-0.5">(0 reviews)</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-400 font-medium">SKU</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase">{sku}</span>
          <button
            type="button"
            onClick={handleCopySku}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            title="Copy SKU"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5. Purchase Card - Dashed Border, Flat, NO Shadow (Pricing /Pc, Out of stock, Minimum order qty removed) */}
      <div
        ref={purchaseBoxRef}
        className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-6 mb-8 bg-white dark:bg-zinc-950 shadow-none"
      >
        <div className="flex flex-col gap-5">
          {/* Price & Quantity Row */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {(currentPrice ?? 0).toLocaleString('en-US')} TZS
            </span>

            {/* QTY Stepper */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">QTY</span>
              <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-10 px-1 shadow-none">
                <button
                  type="button"
                  className="w-8 h-full flex items-center justify-center text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {quantity}
                </span>
                <button
                  type="button"
                  className="w-8 h-full flex items-center justify-center text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                  onClick={() => setQuantity(prev => prev + 1)}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Optional Variants Selector */}
          {variants.length > 0 && (
            <div className="flex flex-col gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-500">
                Variation: <strong className="text-zinc-900 dark:text-zinc-100">{selectedVariant?.name || "Choose"}</strong>
              </span>
              <div className="flex flex-wrap gap-2">
                {variants.map((v: any) => {
                  const isSelected = (v._key || v.name) === (selectedVariant?._key || selectedVariantId);
                  return (
                    <button
                      key={v._key || v.name}
                      type="button"
                      onClick={() => setSelectedVariantId(v._key || v.name)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shadow-none",
                        isSelected
                          ? "bg-[#18181b] text-white border-[#18181b]"
                          : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                      )}
                    >
                      {v.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons: Buy Now & Add to Cart (01) */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                window.location.href = `/cart`;
              }}
              className="h-12 w-full text-sm font-bold bg-[#18181b] hover:bg-[#27272a] text-white rounded-xl transition-colors shadow-none flex items-center justify-center"
            >
              Buy Now
            </button>
            <AddToCartButton
              productId={selectedVariant ? `${product._id}-${selectedVariant._key || selectedVariant.name}` : product._id}
              name={selectedVariant ? `${product.name} (${selectedVariant.name})` : (product.name ?? "Unknown Product")}
              price={currentPrice}
              image={imageUrl ?? undefined}
              stock={currentStock ?? 0}
              quantity={quantity}
              showQuantityControls={false}
              className="h-12 w-full text-sm font-bold bg-[#F7EBF0] hover:bg-[#F0DFE6] text-[#8B1D42] rounded-xl shadow-none transition-colors border-0 flex items-center justify-center"
            >
              Add to cart ({String(quantity).padStart(2, '0')})
            </AddToCartButton>
          </div>

          {/* WhatsApp Direct Order Button - Using Original WhatsApp Icon PNG with Original Colors */}
          <a
            href={`https://wa.me/255769324445?text=${encodeURIComponent(
              `Hi, I would like to order: ${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ''} - Qty: ${quantity} - ${typeof window !== 'undefined' ? window.location.href : ''}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2.5 transition-colors shadow-none"
          >
            <Image
              src="/whatsapp-official.png"
              alt="WhatsApp"
              width={24}
              height={24}
              className="w-6 h-6 object-contain shrink-0"
            />
            <span>Order via WhatsApp Direct</span>
          </a>
        </div>
      </div>

      {/* Sticky Add to Cart Bar - Rendered in Portal */}
      {mounted && createPortal(
        <div className={cn(
          "fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 z-[100] transition-all duration-300 transform w-screen shadow-none",
          showStickyBar ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}>
          <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            {/* Left: Product Info (Desktop only) */}
            <div className="hidden md:flex items-center gap-4 flex-1 min-w-0">
              {imageUrl && (
                <div className="relative h-12 w-12 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex-shrink-0 bg-white dark:bg-zinc-900 shadow-none">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain p-1"
                  />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {formatPrice(currentPrice, "TZS")}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 sm:gap-6 w-full md:w-auto justify-between md:justify-end">
              {/* Price (Mobile only) */}
              <div className="flex flex-col md:hidden">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total</span>
                <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  {formatPrice(currentPrice * quantity, "TZS")}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* QTY Selector (Desktop only) */}
                <div className="hidden sm:flex items-center border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden h-10 bg-white dark:bg-zinc-900 shadow-none">
                  <button
                    type="button"
                    className="px-2.5 h-full hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-r border-zinc-200 dark:border-zinc-800 text-zinc-500"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="px-2.5 h-full hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-l border-zinc-200 dark:border-zinc-800 text-zinc-500"
                    onClick={() => setQuantity(prev => prev + 1)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <AddToCartButton
                  productId={selectedVariant ? `${product._id}-${selectedVariant._key || selectedVariant.name}` : product._id}
                  name={selectedVariant ? `${product.name} (${selectedVariant.name})` : (product.name ?? "Unknown Product")}
                  price={currentPrice}
                  image={imageUrl ?? undefined}
                  stock={currentStock ?? 0}
                  quantity={quantity}
                  showQuantityControls={false}
                  className="h-10 sm:h-11 px-6 sm:px-8 text-xs font-bold tracking-wider bg-[#8B1D42] text-white hover:bg-[#721735] rounded-xl shadow-none transition-colors"
                >
                  Add to Cart ({String(quantity).padStart(2, '0')})
                </AddToCartButton>
              </div>
            </div>
          </div>
          {/* Safe Area Padding for Mobile */}
          <div className="h-[env(safe-area-inset-bottom)] w-full md:hidden" />
        </div>,
        document.body
      )}
    </div>
  );
}
