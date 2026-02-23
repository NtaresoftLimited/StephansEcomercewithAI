"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartActions } from "@/lib/store/cart-store-provider";
import { useWishlistActions, useIsInWishlist } from "@/lib/store/wishlist-store-provider";
import { ProductCard } from "@/components/app/ProductCard";

interface Product {
    _id: string;
    name: string | null;
    slug: string | null;
    price: number | null;
    description?: string | null;
    images: Array<{
        _key: string; // Updated to match ProductCard expectations
        asset: {
            url: string | null;
        } | null;
    }> | null;
    category: {
        title: string | null;
    } | null;
    brand?: {
        name: string | null;
        slug: string | null;
    } | null;
    stock?: number | null;
}

interface AutoRotatingProductGridProps {
    products: Product[];
}

export function AutoRotatingProductGrid({ products }: AutoRotatingProductGridProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const [timeLeft, setTimeLeft] = useState(120);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Ensure brand-first ordering regardless of source sort
    const sortedProducts = useMemo(() => {
        return [...products].sort((a, b) => {
            const aHas = a && (a as any).brand ? 1 : 0;
            const bHas = b && (b as any).brand ? 1 : 0;
            if (bHas !== aHas) return bHas - aHas;
            const an = (a.name || "").toString().toLowerCase();
            const bn = (b.name || "").toString().toLowerCase();
            return an.localeCompare(bn);
        });
    }, [products]);

    // Grid configuration
    const ITEMS_PER_PAGE = 12; // 6 cols x 2 rows
    const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);

    // Auto-rotation effect
    useEffect(() => {
        if (sortedProducts.length <= ITEMS_PER_PAGE) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handlePageChange((currentPage + 1) % totalPages);
                    return 120;
                }
                return prev - 1;
            });
        }, 1000); // tick every second

        return () => clearInterval(timer);
    }, [currentPage, totalPages, sortedProducts.length]);

    const handlePageChange = (newPage: number) => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentPage(newPage);
            setIsTransitioning(false);
            setTimeLeft(120);
        }, 300); // Wait for fade out
    };

    // Current slice of products
    const currentProducts = sortedProducts.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
    );

    if (sortedProducts.length === 0) {
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
                    <ProductCard key={product._id} product={product} />
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
        </section>
    );
}
