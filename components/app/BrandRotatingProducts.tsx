"use client";

import { useState, useEffect, useMemo } from "react";
import { ProductCard } from "@/components/app/ProductCard";
import { cn } from "@/lib/utils";

interface Product {
  _id: string;
  name: string | null;
  slug: string | null;
  price: number | null;
  stock?: number | null;
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

interface BrandRotatingProductsProps {
  products: Product[];
}

export function BrandRotatingProducts({ products }: BrandRotatingProductsProps) {
  const [currentBrandIndex, setCurrentBrandIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const rotationGroups = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];

    const brandGroups: Record<string, Product[]> = {};

    products.forEach((product) => {
      // Brand grouping
      const brandName = product.brand?.name || "Other Brands";
      if (!brandGroups[brandName]) brandGroups[brandName] = [];
      brandGroups[brandName].push(product);
    });
    
    const groups = Object.entries(brandGroups)
      .map(([name, items]) => ({ name, items, type: 'brand' }))
      .filter(group => group.items.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name));

    // If we only have 1 brand, split its products into multiple groups to allow rotation
    if (groups.length === 1 && groups[0].items.length > 6) {
      const singleBrand = groups[0];
      const splitGroups = [];
      for (let i = 0; i < singleBrand.items.length; i += 6) {
        splitGroups.push({
          name: singleBrand.name,
          items: singleBrand.items.slice(i, i + 6),
          type: 'brand',
          subIndex: i / 6
        });
      }
      return splitGroups;
    }

    return groups;
  }, [products]);

  // Ensure index is always valid
  useEffect(() => {
    if (currentBrandIndex >= rotationGroups.length && rotationGroups.length > 0) {
      setCurrentBrandIndex(0);
    }
  }, [rotationGroups.length, currentBrandIndex]);

  // Debug logging
  useEffect(() => {
    console.log(`[BrandRotatingProducts] Groups:`, rotationGroups.map(g => g.name));
    console.log(`[BrandRotatingProducts] Current Index:`, currentBrandIndex);
  }, [rotationGroups, currentBrandIndex]);

  useEffect(() => {
    if (rotationGroups.length <= 1) {
      console.log(`[BrandRotatingProducts] Not enough groups to rotate: ${rotationGroups.length}`);
      return;
    }

    console.log(`[BrandRotatingProducts] Starting 30s rotation interval`);
    const intervalId = setInterval(() => {
      console.log(`[BrandRotatingProducts] Triggering rotation...`);
      setIsTransitioning(true);
      
      // Give time for exit animation
      setTimeout(() => {
        setCurrentBrandIndex((prev) => {
          const next = (prev + 1) % rotationGroups.length;
          console.log(`[BrandRotatingProducts] Moving from index ${prev} to ${next}`);
          return next;
        });
        
        // Short delay before entering
        setTimeout(() => {
          setIsTransitioning(false);
        }, 100);
      }, 600);
    }, 30000);

    return () => {
      console.log(`[BrandRotatingProducts] Clearing interval`);
      clearInterval(intervalId);
    };
  }, [rotationGroups.length]);

  if (rotationGroups.length === 0) return null;

  const currentGroup = rotationGroups[currentBrandIndex];
  if (!currentGroup) return null;

  return (    <section className="py-24 bg-white dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-900 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Featured Brand
              </span>
            </div>
            <h2 className={cn(
              "text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight transition-all duration-500",
              isTransitioning ? "opacity-0 -translate-x-4" : "opacity-100 translate-x-0"
            )}>
              {currentGroup.name}
            </h2>
            <div className="w-16 h-1.5 bg-[#6b3e1e] rounded-full" />
          </div>
        </div>

        <div 
          key={`${currentGroup.name}-${(currentGroup as any).subIndex || 0}`}
          className={cn(
            "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-12 transition-all duration-700 ease-in-out",
            isTransitioning ? "opacity-0 translate-y-8 scale-95" : "opacity-100 translate-y-0 scale-100"
          )}
        >
          {currentGroup.items.slice(0, 12).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
