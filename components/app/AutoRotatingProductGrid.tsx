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
    const [timeLeft, setTimeLeft] = useState(30);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Use products in the exact order they were provided
    const sortedProducts = products;

    // Grid configuration
    const ITEMS_PER_PAGE = 4; // Show 4 items per page
    const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);

    // Auto-rotation effect
    useEffect(() => {
        if (sortedProducts.length <= ITEMS_PER_PAGE) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handlePageChange((currentPage + 1) % totalPages);
                    return 10; // slightly faster rotation for fewer items? or keep 30. Let's keep 30
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
            setTimeLeft(30);
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
        <div className="w-full">
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

            {/* Pagination Dots removed per request */}
        </div>
    );
}
