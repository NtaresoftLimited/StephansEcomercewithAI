"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartActions } from "@/lib/store/cart-store-provider";
import { useWishlistActions, useIsInWishlist } from "@/lib/store/wishlist-store-provider";
import { QuickViewModal } from "@/components/app/QuickViewModal";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Product {
    _id: string;
    name: string | null;
    slug: string | null;
    price: number | null;
    description?: string | null;
    images: Array<{
        asset: {
            url: string | null;
        } | null;
    }> | null;
    category: {
        title: string | null;
    } | null;
    stock?: number | null;
}

interface AutoRotatingProductGridProps {
    products: Product[];
}

export function AutoRotatingProductGrid({ products }: AutoRotatingProductGridProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
    const [timeLeft, setTimeLeft] = useState(120);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Grid configuration
    const ITEMS_PER_PAGE = 12; // 6 cols x 2 rows
    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

    // Auto-rotation effect
    useEffect(() => {
        if (products.length <= ITEMS_PER_PAGE) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handlePageChange((currentPage + 1) % totalPages);
                    return 120;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentPage, totalPages, products.length]);

    const handlePageChange = (newPage: number) => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentPage(newPage);
            setIsTransitioning(false);
            setTimeLeft(120);
        }, 300); // Wait for fade out
    };

    // Current slice of products
    const currentProducts = products.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
    );

    if (products.length === 0) {
        return null;
    }

    return (
        <section className="bg-background">
            {/* Header with Timer */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
                {/* Timer hidden for cleaner look, or made very subtle */}
            </div>

            {/* Grid */}
            <div
                className={cn(
                    "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-12 min-h-[600px] transition-opacity duration-300 ease-in-out",
                    isTransitioning ? "opacity-0" : "opacity-100"
                )}
            >
                {currentProducts.map((product) => (
                    <GridCard
                        key={product._id}
                        product={product}
                        onQuickView={() => setQuickViewProduct(product)}
                    />
                ))}
            </div>

            {/* Pagination Dots */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-3 mt-16">
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                            key={`dot-${index}`}
                            onClick={() => handlePageChange(index)}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-300",
                                currentPage === index
                                    ? "w-8 bg-foreground"
                                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                            )}
                            aria-label={`Go to page ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            <QuickViewModal
                product={quickViewProduct as any} 
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />
        </section>
    );
}

function GridCard({
    product,
    onQuickView
}: {
    product: Product;
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

    return (
        <div className="group relative flex flex-col">
            <Link href={`/products/${product.slug}`} className="block relative">
                <div className="relative aspect-[3/4] overflow-hidden bg-secondary/30 rounded-lg">
                    {mainImage ? (
                        <Image
                            src={mainImage}
                            alt={product.name ?? "Product"}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 16vw"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <span className="text-muted-foreground/40 text-xs uppercase tracking-widest">No image</span>
                        </div>
                    )}

                    {/* Quick Add Button - Minimalist Overlay */}
                    <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 z-10">
                        <button
                            onClick={handleAddToCart}
                            className="w-full h-10 bg-white/90 backdrop-blur-sm text-foreground hover:bg-white transition-colors rounded-md text-xs font-medium tracking-wide uppercase shadow-sm"
                        >
                            Quick Add
                        </button>
                    </div>

                    {/* Badges */}
                    {product.category && (
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-foreground/70">
                                {product.category.title}
                            </span>
                        </div>
                    )}

                    {/* Wishlist Button */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                            onClick={handleToggleWishlist}
                            className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-sm shadow-sm transition-colors hover:bg-white",
                                isInWishlist ? "text-red-500" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Heart className={cn("h-4 w-4", isInWishlist && "fill-current")} />
                        </button>
                    </div>
                </div>
            </Link>

            {/* Content Area */}
            <div className="mt-4 flex flex-col gap-1">
                <Link href={`/products/${product.slug}`} className="group/title">
                    <h3 className="text-sm font-medium text-foreground/90 group-hover/title:text-foreground transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                </Link>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground/70">
                        {formatPrice(product.price)}
                    </span>
                </div>
            </div>
        </div>
    );
}
