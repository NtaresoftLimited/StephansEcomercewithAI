"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Heart, ShoppingCart, Eye, Share2 } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel";
import { cn, formatPrice } from "@/lib/utils";
import { useCartActions } from "@/lib/store/cart-store-provider";
import { useWishlistActions, useIsInWishlist } from "@/lib/store/wishlist-store-provider";
import { QuickViewModal } from "@/components/app/QuickViewModal";
import { toast } from "sonner";

interface FeaturedProduct {
    _id: string;
    name: string | null;
    slug: string | null;
    description: string | null;
    price: number | null;
    images: Array<{
        asset: {
            url: string | null;
        } | null;
    }> | null;
    category: {
        title: string | null;
    } | null;
}

interface ProductShowcaseProps {
    products: FeaturedProduct[];
}

export function ProductShowcase({ products }: ProductShowcaseProps) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);
    const [quickViewProduct, setQuickViewProduct] = useState<FeaturedProduct | null>(null);

    useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap());

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    const scrollPrev = useCallback(() => {
        api?.scrollPrev();
    }, [api]);

    const scrollNext = useCallback(() => {
        api?.scrollNext();
    }, [api]);

    if (products.length === 0) {
        return null;
    }

    return (
        <>
            <section className="bg-white py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-zinc-900">Featured Products</h2>
                            <p className="mt-1 text-sm text-zinc-500">Best picks for your furry friends</p>
                        </div>

                        {/* Navigation Arrows - Hidden on mobile */}
                        <div className="hidden sm:flex items-center gap-2">
                            <button
                                onClick={scrollPrev}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                                aria-label="Previous products"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={scrollNext}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                                aria-label="Next products"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Desktop Carousel - Hidden on mobile */}
                    <div className="hidden sm:block">
                        <Carousel
                            setApi={setApi}
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            plugins={[
                                Autoplay({
                                    delay: 120000,
                                    stopOnInteraction: false,
                                    stopOnMouseEnter: true,
                                }),
                            ]}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-4">
                                {products.map((product) => (
                                    <CarouselItem key={product._id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                                        <ProductShowcaseCard
                                            product={product}
                                            onQuickView={() => setQuickViewProduct(product)}
                                        />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                        </Carousel>

                        {/* Dot Indicators */}
                        {count > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                {Array.from({ length: Math.min(count, 6) }).map((_, index) => (
                                    <button
                                        key={`dot-${index}`}
                                        type="button"
                                        onClick={() => api?.scrollTo(index)}
                                        className={cn(
                                            "h-2 w-2 rounded-full transition-all duration-300",
                                            current === index
                                                ? "w-6 bg-[#6b3e1e]"
                                                : "bg-zinc-300 hover:bg-zinc-400"
                                        )}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Mobile Reels-Style View */}
                    <div className="sm:hidden">
                        <MobileReelsView
                            products={products}
                            onQuickView={setQuickViewProduct}
                        />
                    </div>
                </div>
            </section>

            {/* Quick View Modal */}
            <QuickViewModal
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />
        </>
    );
}

// Mobile Reels-style vertical scroll view
function MobileReelsView({
    products,
    onQuickView
}: {
    products: FeaturedProduct[];
    onQuickView: (product: FeaturedProduct) => void;
}) {
    return (
        <div className="space-y-4">
            {products.slice(0, 5).map((product) => (
                <MobileProductCard
                    key={product._id}
                    product={product}
                    onQuickView={() => onQuickView(product)}
                />
            ))}
        </div>
    );
}

// Full-width, full-height mobile product card (Instagram Reels style)
function MobileProductCard({
    product,
    onQuickView,
}: {
    product: FeaturedProduct;
    onQuickView: () => void;
}) {
    const mainImage = product.images?.[0]?.asset?.url;
    const { addItem } = useCartActions();
    const { toggleItem } = useWishlistActions();
    const isInWishlist = useIsInWishlist(product._id);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
            productId: product._id,
            name: product.name ?? "Product",
            price: product.price ?? 0,
            image: mainImage ?? undefined,
        });
        toast.success("Added to cart!");
    };

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggleItem({
            productId: product._id,
            name: product.name ?? "Product",
            price: product.price ?? 0,
            image: mainImage ?? undefined,
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
        onQuickView();
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
                // User cancelled or share failed
            }
        } else {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
        }
    };

    return (
        <Link href={`/products/${product.slug}`} className="block relative h-[85vh] w-full snap-center">
            {/* Full-height product image */}
            <div className="absolute inset-0 bg-zinc-100">
                {mainImage ? (
                    <Image
                        src={mainImage}
                        alt={product.name ?? "Product"}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="100vw"
                        priority
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300">
                        <span className="text-zinc-500">No image</span>
                    </div>
                )}

                {/* Dark Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            </div>

            {/* Category Badge - Top Left */}
            {product.category && (
                <span className="absolute left-4 top-4 rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-xs font-medium text-white border border-white/20">
                    {product.category.title}
                </span>
            )}

            {/* Action Buttons - Right Side */}
            <div className="absolute right-4 bottom-24 flex flex-col items-center gap-4 z-10">
                {/* Wishlist */}
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={handleToggleWishlist}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white transition-transform active:scale-95 border border-white/10"
                        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        <Heart className={cn("h-5 w-5", isInWishlist && "fill-red-500 text-red-500")} />
                    </button>
                    <span className="text-[10px] font-medium text-white drop-shadow-md">Like</span>
                </div>

                {/* Quick View */}
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={handleQuickView}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white transition-transform active:scale-95 border border-white/10"
                        aria-label="Quick view"
                    >
                        <Eye className="h-5 w-5" />
                    </button>
                    <span className="text-[10px] font-medium text-white drop-shadow-md">View</span>
                </div>

                {/* Share */}
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={handleShare}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white transition-transform active:scale-95 border border-white/10"
                        aria-label="Share"
                    >
                        <Share2 className="h-5 w-5" />
                    </button>
                    <span className="text-[10px] font-medium text-white drop-shadow-md">Share</span>
                </div>

                {/* Buy Now - Prominent Theme Button */}
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={handleAddToCart}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6b3e1e] text-white shadow-lg shadow-[#6b3e1e]/40 transition-transform active:scale-95 border-2 border-white/20"
                        aria-label="Add to cart"
                    >
                        <ShoppingCart className="h-5 w-5" />
                    </button>
                    <span className="text-[10px] font-bold text-white drop-shadow-md">Buy Now</span>
                </div>
            </div>

            {/* Product Info Overlay - Bottom Left */}
            <div className="absolute bottom-6 left-4 right-20 z-10">
                <h3 className="text-xl font-bold text-white drop-shadow-md line-clamp-2 mb-1">
                    {product.name}
                </h3>
                {product.description && (
                    <p className="text-sm text-zinc-200 drop-shadow-md line-clamp-2 mb-2 leading-relaxed opacity-90">
                        {product.description}
                    </p>
                )}
                <p className="text-2xl font-bold text-white drop-shadow-md">
                    {formatPrice(product.price)}
                </p>
            </div>
        </Link>
    );
}

interface ProductShowcaseCardProps {
    product: FeaturedProduct;
    onQuickView: () => void;
}

// Desktop product card with hover actions
function ProductShowcaseCard({ product, onQuickView }: ProductShowcaseCardProps) {
    const mainImage = product.images?.[0]?.asset?.url;
    const { addItem } = useCartActions();
    const { toggleItem } = useWishlistActions();
    const isInWishlist = useIsInWishlist(product._id);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
            productId: product._id,
            name: product.name ?? "Product",
            price: product.price ?? 0,
            image: mainImage ?? undefined,
        });
        toast.success("Added to cart!");
    };

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggleItem({
            productId: product._id,
            name: product.name ?? "Product",
            price: product.price ?? 0,
            image: mainImage ?? undefined,
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
        onQuickView();
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
                // User cancelled or share failed
            }
        } else {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
        }
    };

    return (
        <Link href={`/products/${product.slug}`} className="group block">
            {/* Image Container - Portrait Ratio */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-zinc-100">
                {mainImage ? (
                    <Image
                        src={mainImage}
                        alt={product.name ?? "Product"}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200">
                        <span className="text-zinc-400">No image</span>
                    </div>
                )}

                {/* Category Badge - Top Left */}
                {product.category && (
                    <span className="absolute left-3 top-3 rounded bg-[#1e3a5f] px-2.5 py-1 text-xs font-medium text-white shadow-sm">
                        {product.category.title}
                    </span>
                )}

                {/* Hover Action Buttons - Right Side */}
                <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
            </div>

            {/* Product Info - Clean Typography */}
            <div className="mt-4 space-y-1">
                <h3 className="text-sm font-medium text-zinc-700 line-clamp-1 group-hover:text-zinc-900 transition-colors">
                    {product.name}
                </h3>
                <p className="text-base font-semibold text-zinc-900">
                    {formatPrice(product.price)}
                </p>
            </div>
        </Link>
    );
}
