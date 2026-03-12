"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Star, RefreshCw, Info, MessageCircle, Users, Heart, Share2, Truck, ShieldCheck, RotateCcw, CreditCard, ExternalLink, ShoppingBag, Minus, Plus } from "lucide-react";
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

  // Live Visitors state
  const [liveVisitors, setLiveVisitors] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const purchaseBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate a random initial number between 15 and 45
    setLiveVisitors(Math.floor(Math.random() * 30) + 15);

    // Randomly update the number every 5-15 seconds to simulate activity
    const interval = setInterval(() => {
      setLiveVisitors(prev => {
        if (!prev) return 20;
        const change = Math.random() > 0.5 ? 1 : -1;
        // Keep between 10 and 50
        return Math.max(10, Math.min(50, prev + change * Math.floor(Math.random() * 3 + 1)));
      });
    }, Math.floor(Math.random() * 10000) + 5000);

    // Intersection Observer for sticky bar visibility
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar when the purchase box is NOT visible (scrolled past)
        setShowStickyBar(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "-100px 0px 0px 0px" // Trigger slightly before it's completely gone
      }
    );

    if (purchaseBoxRef.current) {
      observer.observe(purchaseBoxRef.current);
    }

    return () => {
      clearInterval(interval);
      if (purchaseBoxRef.current) {
        observer.unobserve(purchaseBoxRef.current);
      }
    };
  }, []);

  const variants = product.variants || [];
  const selectedVariant = variants.find((v: any) => v._key === selectedVariantId) || null;

  // Determine current price and stock based on selection
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const imageUrl = product.images?.[0]?.asset?.url;

  return (
    <div className="flex flex-col animate-in fade-in w-full">
      {/* Header Section */}
      <div className="mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-6">
        {/* Brand Link */}
        {product.brand && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Brand</span>
            <Link
              href={`/brands/${product.brand.slug?.current || product.brand.slug}`}
              className="text-xs font-bold uppercase tracking-widest text-[#D35122] hover:underline"
            >
              {product.brand.name}
            </Link>
          </div>
        )}

        <div className="flex justify-between items-start gap-4 mb-4">
          <h1 className="text-xl md:text-2xl font-semibold tracking-normal leading-tight text-zinc-900 dark:text-zinc-50">
            {product.name}
          </h1>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={cn(
                "p-3 rounded-full border transition-all duration-300",
                isWishlisted
                  ? "bg-red-50 border-red-200 text-red-500 shadow-sm"
                  : "bg-white border-zinc-200 text-zinc-400 hover:text-red-500 hover:border-red-200 dark:bg-zinc-900 dark:border-zinc-800"
              )}
            >
              <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: product.name,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }
              }}
              className="p-3 rounded-full border border-zinc-200 bg-white text-zinc-400 hover:text-zinc-900 hover:border-zinc-300 transition-all dark:bg-zinc-900 dark:border-zinc-800 dark:hover:text-zinc-100 dark:hover:border-zinc-700"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
          {/* Rating Section */}
          <div className="flex items-center gap-2 hidden">
            <div className="flex text-[#D35122]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">5.0</span>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
              (128 Reviews)
            </span>
          </div>

          {/* SKU Section */}
          {product.sku && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">SKU</span>
              <code className="text-xs font-bold text-zinc-900 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                {product.sku}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(product.sku);
                  alert("SKU copied!");
                }}
                className="text-zinc-400 hover:text-[#D35122] transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live Visitors Alert */}
      {liveVisitors !== null && (
        <div className="mb-6 flex items-center gap-2 text-sm text-[#D35122] font-medium bg-[#D35122]/10 dark:bg-[#D35122]/20 py-2 px-4 rounded-full w-fit border border-[#D35122]/20 shadow-sm backdrop-blur-sm">
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D35122] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D35122]"></span>
          </div>
          <Users className="w-4 h-4 ml-1" />
          <span className="animate-in fade-in slide-in-from-bottom-1">{liveVisitors} people are viewing this right now</span>
        </div>
      )}

      {/* Purchase Box - CMS Style */}
      <div ref={purchaseBoxRef} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 mb-8 bg-white dark:bg-zinc-900/30 shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col gap-4">
          {/* Header Row: Price and QTY */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex flex-col">
              <span className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50">
                {formatPrice(currentPrice)}
              </span>
              <div className="mt-2 flex flex-col gap-1">
                <p className="text-xs text-zinc-400 font-medium tracking-wide">
                  Minimum order qty <span className="font-bold text-zinc-900 dark:text-zinc-100">{product.min_qty || 1}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">QTY</span>
                <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden h-10">
                  <button
                    type="button"
                    className="px-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-r border-zinc-200 dark:border-zinc-800"
                    onClick={() => setQuantity(prev => Math.max(product.min_qty || 1, prev - 1))}
                  >
                    <span className="text-zinc-400 font-bold">−</span>
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    readOnly
                    className="w-10 text-center text-sm font-bold bg-transparent border-none appearance-none"
                  />
                  <button
                    type="button"
                    className="px-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-l border-zinc-200 dark:border-zinc-800"
                    onClick={() => setQuantity(prev => (currentStock > prev ? prev + 1 : prev))}
                  >
                    <span className="text-zinc-400 font-bold">+</span>
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
                  const msg = encodeURIComponent(`Hi, I would like to order: ${product.name} - ${pageUrl}`);
                  window.open(`https://wa.me/255743419999?text=${msg}`, '_blank');
                }}
                className="flex items-center gap-1.5 text-[#25D366] hover:opacity-80 transition-all group"
              >
                <MessageCircle className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
                <span className="text-sm font-semibold">Order Via WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800 my-2" />

          {/* Selected Product Summary removed as requested */}

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 mt-2">
            <button
              onClick={() => {/* Buy Now logic would go here if implemented, for now it matches UI */ }}
              className="h-14 flex-1 text-sm font-bold tracking-widest uppercase bg-[#1A1A1E] text-white hover:bg-[#2A2A2E] rounded-lg transition-all active:scale-[0.98]"
            >
              Buy Now
            </button>
            <AddToCartButton
              productId={product._id}
              name={product.name ?? "Unknown Product"}
              price={currentPrice}
              image={imageUrl ?? undefined}
              stock={currentStock ?? 0}
              className="h-14 flex-1 text-sm font-bold tracking-widest uppercase bg-[#E8F3FF] text-[#0080FF] hover:bg-[#D8E9FF] rounded-lg shadow-none transition-all active:scale-[0.98]"
            />
          </div>
        </div>
      </div>




      {/* Trust Badges Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 hidden">
        {[
          { icon: Truck, label: "Free Shipping", desc: "For orders over 50k" },
          { icon: CreditCard, label: "Secure Payment", desc: "100% Secure" },
          { icon: ShieldCheck, label: "Warranty", desc: "Authentic products" },
          { icon: RotateCcw, label: "Easy Return", desc: "7 days easy return" },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center text-center p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 shadow-sm transition-all hover:shadow-md">
            <item.icon className="w-6 h-6 text-[#D35122] mb-2" />
            <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-900 dark:text-zinc-50">{item.label}</span>
            <span className="text-[9px] text-zinc-400 mt-1">{item.desc}</span>
          </div>
        ))}
      </div>

      {/* Estimate Shipping Section */}
      <div className="mb-8 p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center gap-3 hidden">
        <Truck className="w-5 h-5 text-zinc-400" />
        <div>
          <span className="text-xs font-medium text-zinc-500">Estimate Shipping Time</span>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">3 - 5 Days</p>
        </div>
      </div>

      {/* Seller Section */}
      <div className="mb-8 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#D35122] text-white flex items-center justify-center font-bold text-xl ring-4 ring-white dark:ring-zinc-800 shadow-lg">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Sold by Stephan's Pet Store</span>
              <Check className="w-3.5 h-3.5 text-white bg-blue-500 rounded-full p-0.5" strokeWidth={4} />
            </div>
            <Link href="/about" className="text-xs text-[#D35122] font-semibold hover:underline">
              Visit Store
            </Link>
          </div>
        </div>
        <Link
          href="/contact"
          className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold uppercase text-zinc-900 dark:text-white shadow-sm hover:shadow-md transition-all"
        >
          Message Seller
        </Link>
      </div>

      {/* Sticky Add to Cart Bar - Adorama Style */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 z-[100] transition-all duration-500 transform",
        showStickyBar ? "translate-y-0 opacity-100 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]" : "translate-y-full opacity-0 pointer-events-none"
      )}>
        <div className="w-full px-2 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Left: Product Info (Desktop only) */}
          <div className="hidden md:flex items-center gap-4 flex-1 min-w-0">
            {imageUrl && (
              <div className="relative h-12 w-12 rounded-lg border border-zinc-100 dark:border-zinc-800 overflow-hidden flex-shrink-0 bg-white">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain p-1"
                />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate">
                {product.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-[#D35122]">
                  {formatPrice(currentPrice)}
                </span>
                {currentStock > 0 ? (
                  <Badge variant="outline" className="text-[10px] h-4 bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50">
                    In Stock
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] h-4 bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50">
                    Out of Stock
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 sm:gap-6 w-full md:w-auto justify-between md:justify-end">
            {/* Price (Mobile only) */}
            <div className="flex flex-col md:hidden">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total</span>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {formatPrice(currentPrice * quantity)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* QTY Selector (Desktop only) */}
              <div className="hidden sm:flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden h-10 bg-white dark:bg-zinc-900">
                <button
                  type="button"
                  className="px-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-r border-zinc-200 dark:border-zinc-800"
                  onClick={() => setQuantity(prev => Math.max(product.min_qty || 1, prev - 1))}
                >
                  <Minus className="w-3 h-3 text-zinc-400" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  readOnly
                  className="w-8 text-center text-xs font-bold bg-transparent border-none appearance-none"
                />
                <button
                  type="button"
                  className="px-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-l border-zinc-200 dark:border-zinc-800"
                  onClick={() => setQuantity(prev => (currentStock > prev ? prev + 1 : prev))}
                >
                  <Plus className="w-3 h-3 text-zinc-400" />
                </button>
              </div>

              <AddToCartButton
                productId={product._id}
                name={product.name ?? "Unknown Product"}
                price={currentPrice}
                image={imageUrl ?? undefined}
                stock={currentStock ?? 0}
                className="h-10 sm:h-11 px-6 sm:px-8 text-xs font-bold tracking-widest uppercase bg-[#D35122] text-white hover:bg-[#B54218] rounded-lg shadow-sm transition-all active:scale-[0.98] min-w-[140px]"
              >
                Add to Cart
              </AddToCartButton>
            </div>
          </div>
        </div>
        {/* Safe Area Padding for Mobile */}
        <div className="h-[env(safe-area-inset-bottom)] w-full md:hidden" />
      </div>
    </div>
  );
}
