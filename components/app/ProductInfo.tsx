"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { RefreshCw, Heart, Copy, Minus, Plus, Check } from "lucide-react";
import { AddToCartButton } from "@/components/app/AddToCartButton";
import { useCartActions } from "@/lib/store/cart-store-provider";
import { useWishlistActions, useIsInWishlist } from "@/lib/store/wishlist-store-provider";
import { resolveProductBrand } from "@/lib/catalog/brand-resolver";
import { formatPrice, cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProductInfoProps {
  product: any;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter();
  const { addItem } = useCartActions();
  const { toggleItem } = useWishlistActions();
  const isInWishlist = useIsInWishlist(product?._id ?? "");

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants?.[0]?._key || null
  );

  const [quantity, setQuantity] = useState(1);
  const [isCompared, setIsCompared] = useState(false);
  const [copiedSku, setCopiedSku] = useState(false);
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
  // Only show variation selector when there are genuinely multiple distinct variants
  const distinctVariantNames = new Set(
    variants.map((v: any) => v?.name?.trim()).filter(Boolean)
  );
  const hasMultipleVariants = variants.length > 1 && distinctVariantNames.size > 1;
  const selectedVariant = hasMultipleVariants
    ? (variants.find((v: any) => (v._key || v.name) === selectedVariantId) || variants[0] || null)
    : null;

  // Determine current price based on selection
  const currentPrice = (selectedVariant ? selectedVariant.price : null) ?? product.price ?? product.variants?.[0]?.price ?? 0;
  const currentStock = (selectedVariant ? selectedVariant.stock : null) ?? product.stock ?? product.variants?.[0]?.stock ?? 10;
  const imageUrl = product.images?.[0]?.asset?.url || (typeof product.images?.[0] === "string" ? product.images?.[0] : product.images?.[0]?.url);
  const resolvedBrand = resolveProductBrand(product);
  const sku = product.sku || product._id?.slice(-8).toUpperCase() || "SP-001";
  const productSlug = typeof product.slug === "string" ? product.slug : product.slug?.current || "";

  const handleToggleWishlist = () => {
    const added = toggleItem({
      productId: product._id,
      name: product.name ?? "Product",
      price: currentPrice ?? 0,
      image: imageUrl ?? undefined,
      slug: productSlug,
    });
    if (added) {
      toast.success("Added to wishlist");
    } else {
      toast.info("Removed from wishlist");
    }
  };

  const handleToggleCompare = () => {
    const next = !isCompared;
    setIsCompared(next);
    if (next) {
      toast.success("Added to compare list");
    } else {
      toast.info("Removed from compare list");
    }
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard");
    }
  };

  const handleCopySku = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(sku);
      setCopiedSku(true);
      toast.success("SKU copied to clipboard");
      setTimeout(() => setCopiedSku(false), 2000);
    }
  };

  const handleBuyNow = () => {
    addItem(
      {
        productId: selectedVariant ? `${product._id}-${selectedVariant._key || selectedVariant.name}` : product._id,
        name: selectedVariant ? `${product.name} (${selectedVariant.name})` : (product.name ?? "Product"),
        price: currentPrice ?? 0,
        image: imageUrl ?? undefined,
      },
      quantity
    );
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col w-full text-left">
      {/* 1. Top Row: Original Brand Logo (Left, if available) & Utility Actions (Right) */}
      <div className="flex items-center justify-between gap-3 mb-3">
        {resolvedBrand?.logo ? (
          resolvedBrand.slug ? (
            <Link
              href={`/brands/${resolvedBrand.slug}`}
              aria-label={resolvedBrand.name}
              className="inline-flex items-center shrink-0 hover:opacity-85 transition-opacity"
            >
              <Image
                src={resolvedBrand.logo}
                alt={resolvedBrand.name}
                width={96}
                height={32}
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </Link>
          ) : (
            <div className="inline-flex items-center shrink-0">
              <Image
                src={resolvedBrand.logo}
                alt={resolvedBrand.name}
                width={96}
                height={32}
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </div>
          )
        ) : (
          <div />
        )}

        <div className="flex items-center justify-end gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <button
            type="button"
            onClick={handleToggleCompare}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer",
              isCompared
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-200/80 bg-white text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            )}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Compare</span>
          </button>

          <button
            type="button"
            onClick={handleToggleWishlist}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer",
              isInWishlist
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-200/80 bg-white text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            )}
          >
            <Heart className={cn("w-3.5 h-3.5", isInWishlist && "fill-current")} />
            <span>Wishlist</span>
          </button>
        </div>
      </div>

      {/* 2. Product Name */}
      <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2.5 leading-snug">
        {product.name}
      </h1>

      {/* 3. Rating & SKU Row */}
      <div className="flex items-center justify-between gap-4 pb-4 mb-5 border-b border-zinc-200/80 dark:border-zinc-800 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="flex text-zinc-300 dark:text-zinc-700 text-xs tracking-tight">☆☆☆☆☆</div>
          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">0</span>
          <span className="text-zinc-400 text-xs">/5.0</span>
          <span className="text-zinc-400 text-xs">(0 reviews)</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-400 font-medium">SKU</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase">{sku}</span>
          <button
            type="button"
            onClick={handleCopySku}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Copy SKU"
          >
            {copiedSku ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 4. Purchase Area - Neutral Minimalist Container */}
      <div
        ref={purchaseBoxRef}
        className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 mb-6 bg-white dark:bg-zinc-950 shadow-none"
      >
        <div className="flex flex-col gap-4">
          {/* Price & Quantity Row */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {(currentPrice ?? 0).toLocaleString('en-US')} TZS
            </span>

            {/* QTY Stepper */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">QTY</span>
              <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-9 px-1 shadow-none">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  className="w-7 h-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  className="w-7 h-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                  onClick={() => setQuantity(prev => prev + 1)}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Optional Variants Selector - only show when genuine multiple variants exist */}
          {hasMultipleVariants && (
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
                        "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shadow-none cursor-pointer",
                        isSelected
                          ? "bg-[#3e220f] text-white border-[#3e220f]"
                          : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                      )}
                    >
                      {v.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons: Minimalist Brand Colors */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleBuyNow}
              className="h-11 w-full text-xs sm:text-sm font-semibold bg-[#3e220f] hover:bg-[#2a170a] text-white rounded-xl transition-colors shadow-none flex items-center justify-center cursor-pointer"
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
              className="h-11 w-full text-xs sm:text-sm font-semibold bg-zinc-100 hover:bg-zinc-200/80 text-zinc-900 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-none transition-colors flex items-center justify-center cursor-pointer"
            >
              Add to cart ({String(quantity).padStart(2, '0')})
            </AddToCartButton>
          </div>

          {/* WhatsApp Direct Order Button - Minimalist Neutral Button with Original Full-Color WhatsApp PNG */}
          <a
            href={`https://wa.me/255769324445?text=${encodeURIComponent(
              `Hi, I would like to order: ${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ''} - Qty: ${quantity} - ${typeof window !== 'undefined' ? window.location.href : ''}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-colors shadow-none"
          >
            <Image
              src="/whatsapp-official.png"
              alt="WhatsApp"
              width={20}
              height={20}
              className="w-5 h-5 object-contain shrink-0"
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
                  className="h-10 sm:h-11 px-6 sm:px-8 text-xs font-semibold tracking-wider bg-[#3e220f] text-white hover:bg-[#2a170a] rounded-xl shadow-none transition-colors"
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
