"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect, useMemo, Suspense } from "react";
import { X, ChevronDown, Search, Filter, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DEEP_NAV_MENU } from "@/lib/config/navigation";

interface Category {
  _id: string;
  title: string;
  slug: string;
  parentCategory?: {
    title: string;
    slug: string;
  } | null;
  productCount: number;
}

interface ProductFiltersProps {
  categories: Category[];
  brands: any[];
}

function ProductFiltersInner({ categories, brands }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("q") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const currentBrand = searchParams.get("brand") ?? "";
  const currentColor = searchParams.get("color") ?? "";
  const urlMinPrice = Number(searchParams.get("minPrice")) || 0;
  const urlMaxPrice = Number(searchParams.get("maxPrice")) || 500000;
  const currentInStock = searchParams.get("inStock") === "true";

  // Local state for UI
  const [brandSearch, setBrandSearch] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const categoryTree = useMemo(() => {
    // 1. Filter out categories with no products
    const linkedCategories = categories.filter(cat => cat.productCount > 0);
    
    const root: Record<string, { title: string; slug: string; children: { title: string; slug: string }[] }> = {};
    
    // 2. Identify top-level categories (DOGS, CATS, BIRDS, SMALL PETS)
    linkedCategories.forEach(cat => {
      if (!cat.parentCategory) {
        const titleUpper = cat.title?.toUpperCase();
        // Skip noisy/singular top-level names if they exist as duplicates
        if (titleUpper === "CAT" || titleUpper === "DOG" || titleUpper === "UNCATEGORIZED") return;
        
        root[cat.slug] = { title: cat.title, slug: cat.slug, children: [] };
      }
    });

    // 3. Add children from Sanity
    linkedCategories.forEach(cat => {
      if (cat.parentCategory && root[cat.parentCategory.slug]) {
        // Only add if not already present
        if (!root[cat.parentCategory.slug].children.some(c => c.slug === cat.slug)) {
          root[cat.parentCategory.slug].children.push({ title: cat.title, slug: cat.slug });
        }
      }
    });

    // 4. Enrich/Fallback with DEEP_NAV_MENU structure
    const navMapping: Record<string, keyof typeof DEEP_NAV_MENU> = {
      'dogs': 'dogs',
      'cats': 'cats',
      'birds': 'birds',
      'small-pets': 'smallPets'
    };

    Object.entries(navMapping).forEach(([slug, navKey]) => {
      if (root[slug]) {
        const navItems = DEEP_NAV_MENU[navKey];
        navItems.forEach(section => {
          const sectionSlug = section.href.split('category=')[1];
          if (sectionSlug && !root[slug].children.some(c => c.slug === sectionSlug)) {
            // ONLY add if it has products (check in linkedCategories)
            const sanityCat = linkedCategories.find(c => c.slug === sectionSlug);
            if (sanityCat) {
              root[slug].children.push({ title: section.title, slug: sectionSlug });
            }
          }
          // Also add sub-items if they have products
          section.items.forEach(item => {
            const itemSlug = item.href.split('category=')[1];
            if (itemSlug && !root[slug].children.some(c => c.slug === itemSlug)) {
              const sanityCat = linkedCategories.find(c => c.slug === itemSlug);
              if (sanityCat) {
                root[slug].children.push({ title: item.name, slug: itemSlug });
              }
            }
          });
        });
      }
    });

    // 5. Return sorted by title
    return Object.values(root).sort((a, b) => a.title.localeCompare(b.title));
  }, [categories]);

  // Open the parent category if a child is selected
  useEffect(() => {
    if (currentCategory) {
      const parent = categories.find(c => c.slug === currentCategory)?.parentCategory;
      if (parent) {
        setOpenCategories(prev => ({ ...prev, [parent.slug]: true }));
      }
    }
  }, [currentCategory, categories]);

  const updateParams = useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === 0) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handleClearFilters = () => {
    router.push("/shop", { scroll: false });
  };

  const clearSingleFilter = (key: string) => {
    if (key === "price") {
      updateParams({ minPrice: null, maxPrice: null });
    } else {
      updateParams({ [key]: null });
    }
  };

  const filteredBrands = brands.filter(b => 
    b.productCount > 0 && 
    b.name?.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const isPriceActive = urlMinPrice > 0 || urlMaxPrice < 500000;
  const hasActiveFilters = !!(currentSearch || currentCategory || currentBrand || currentColor || isPriceActive || currentInStock);

  return (
    <div className="flex flex-col gap-6">
      {/* Container with background and border as requested */}
      <div className="max-h-fit rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6">
          
          {/* Deals Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-md leading-5 font-bold text-zinc-900">Deals</span>
            </div>
            <Link
              href="/shop/offers"
              className="text-sm leading-5 font-medium text-zinc-600 hover:text-[#c77e35] transition-colors"
            >
              Today&apos;s Deals
            </Link>
            <div className="h-px w-full bg-zinc-100"></div>
          </div>
          {/* Categories Section (Maintaining existing logic but with new styling) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-md leading-5 font-bold text-zinc-900">Categories</span>
              {currentCategory && (
                <button onClick={() => clearSingleFilter("category")} className="text-[10px] font-bold text-[#c77e35] uppercase hover:underline">Clear</button>
              )}
            </div>
            <div className="space-y-1">
              {categoryTree.map((root) => (
                <Collapsible
                  key={root.slug}
                  open={openCategories[root.slug]}
                  onOpenChange={(isOpen) => setOpenCategories(prev => ({ ...prev, [root.slug]: isOpen }))}
                  className="group"
                >
                  <CollapsibleTrigger asChild>
                    <div className={cn(
                      "flex w-full items-center justify-between p-2 rounded-lg cursor-pointer transition-all",
                      currentCategory === root.slug ? "bg-[#c77e35]/5 text-[#c77e35]" : "hover:bg-zinc-50"
                    )}>
                      <span className="text-sm font-semibold">{root.title}</span>
                      <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", openCategories[root.slug] && "rotate-180")} />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 pt-1 pb-2 space-y-1 animate-in fade-in slide-in-from-top-1 max-h-64 overflow-y-auto scrollbar-hide">
                    <button
                      onClick={() => updateParams({ category: currentCategory === root.slug ? null : root.slug })}
                      className={cn(
                        "w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors",
                        currentCategory === root.slug ? "text-[#c77e35] font-bold" : "text-zinc-500 hover:text-zinc-900"
                      )}
                    >
                      All {root.title}
                    </button>
                    {root.children.sort((a,b) => a.title.localeCompare(b.title)).map((child) => (
                      <button
                        key={child.slug}
                        onClick={() => updateParams({ category: currentCategory === child.slug ? null : child.slug })}
                        className={cn(
                          "w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors",
                          currentCategory === child.slug 
                            ? "bg-[#c77e35] text-white font-medium" 
                            : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                        )}
                      >
                        {child.title}
                      </button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
            <div className="h-px w-full bg-zinc-100"></div>
          </div>

          {/* Brand Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-md leading-5 font-bold text-zinc-900">Brand</span>
              {currentBrand && (
                <button onClick={() => clearSingleFilter("brand")} className="text-[10px] font-bold text-[#c77e35] uppercase hover:underline">Clear</button>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input 
                type="text"
                placeholder="Search Brand"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="h-10 w-full rounded-full border border-zinc-200 bg-white pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c77e35]/20 transition-all"
              />
            </div>
            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
              {filteredBrands.map((brand) => (
                <label key={brand.slug} className="text-sm leading-4 font-normal flex items-center gap-3 align-middle cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={currentBrand === brand.slug}
                      onChange={() => updateParams({ brand: currentBrand === brand.slug ? null : brand.slug })}
                      className="peer appearance-none size-5 shrink-0 rounded border border-zinc-300 shadow-sm focus-visible:outline-none checked:bg-[#c77e35] checked:border-[#c77e35] transition-all" 
                    />
                    <svg className="absolute size-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className={cn(
                    "text-sm leading-5 font-medium transition-colors truncate flex-1",
                    currentBrand === brand.slug ? "text-[#c77e35]" : "text-zinc-600 group-hover:text-[#c77e35]"
                  )}>
                    {brand.name}
                  </span>
                </label>
              ))}
              {filteredBrands.length === 0 && (
                <p className="text-xs text-center text-zinc-400 py-2">No brands found</p>
              )}
            </div>
            <div className="h-px w-full bg-zinc-100"></div>
          </div>

          {/* Price Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="text-md leading-5 font-bold text-zinc-900">Price</div>
              <span className="text-[10px] font-bold rounded-full bg-[#c77e35] px-2 py-0.5 leading-5 text-white">
                TSh {urlMinPrice.toLocaleString()} - {urlMaxPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <input 
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-center text-sm text-zinc-600 focus:ring-2 focus:ring-[#c77e35]/20 outline-none" 
                type="text" 
                value={urlMinPrice}
                onChange={(e) => updateParams({ minPrice: Number(e.target.value) || 0 })}
              />
              <span className="text-zinc-400">-</span>
              <input 
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-center text-sm text-zinc-600 focus:ring-2 focus:ring-[#c77e35]/20 outline-none" 
                type="text" 
                value={urlMaxPrice}
                onChange={(e) => updateParams({ maxPrice: Number(e.target.value) || 500000 })}
              />
            </div>
            <div className="px-1 pt-2">
              <Slider
                defaultValue={[urlMinPrice, urlMaxPrice]}
                max={500000}
                step={1000}
                onValueChange={([min, max]) => updateParams({ minPrice: min, maxPrice: max })}
                className="text-[#c77e35]"
              />
            </div>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              className="w-full bg-[#c77e35] hover:bg-black text-white rounded-xl py-6 flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[10px] transition-all"
            >
              <RotateCcw className="h-3 w-3" />
              Reset All Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductFilters(props: ProductFiltersProps) {
  return (
    <Suspense fallback={null}>
      <ProductFiltersInner {...props} />
    </Suspense>
  );
}
