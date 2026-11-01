"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/app/ProductCard";

interface Product {
    _id: string;
    name: string | null;
    slug: string | null;
    price: number | null;
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
    stock?: number | null;
}

interface AutoRotatingProductGridProps {
    products: Product[];
}

export function AutoRotatingProductGrid({ products }: AutoRotatingProductGridProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Grid configuration: 4 items per page / rotation
    const ITEMS_PER_PAGE = 4;
    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

    // Auto-rotation effect: changes every 20 seconds
    useEffect(() => {
        if (totalPages <= 1 || isPaused) return;

        const interval = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentPage((prev) => (prev + 1) % totalPages);
                setIsTransitioning(false);
            }, 300); // 300ms fade transition
        }, 20000); // Exactly 20 seconds

        return () => clearInterval(interval);
    }, [totalPages, isPaused]);

    const handlePageChange = (newPage: number) => {
        if (newPage === currentPage) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentPage(newPage);
            setIsTransitioning(false);
        }, 300);
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
        <div 
            className="w-full"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Grid */}
            <div
                className={cn(
                    "grid grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity duration-300 ease-in-out",
                    isTransitioning ? "opacity-0" : "opacity-100"
                )}
            >
                {currentProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>

            {/* Subtle rotation page indicators */}
            {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-2">
                    {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handlePageChange(idx)}
                            aria-label={`Go to slide ${idx + 1}`}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-300",
                                idx === currentPage 
                                    ? "w-6 bg-[#3e220f]" 
                                    : "w-1.5 bg-[#eae3d9] hover:bg-[#c77e35]"
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
