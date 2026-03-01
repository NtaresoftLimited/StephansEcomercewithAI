"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { SORT_OPTIONS } from "@/lib/constants/filters";
// import type { ALL_CATEGORIES_QUERYResult } from "@/sanity.types";

interface ProductFiltersProps {
  categories: any[];
  brands: any[];
}

export function ProductFilters({ categories, brands }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("q") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const currentBrand = searchParams.get("brand") ?? "";
  const currentColor = searchParams.get("color") ?? "";
  const currentSort = searchParams.get("sort") ?? "name";
  const urlMinPrice = Number(searchParams.get("minPrice")) || 0;
  const urlMaxPrice = Number(searchParams.get("maxPrice")) || 500000;
  const currentInStock = searchParams.get("inStock") === "true";

  // Local state for price range
  const [priceRange, setPriceRange] = useState<[number, number]>([
    urlMinPrice,
    urlMaxPrice,
  ]);

  // Sync local state when URL changes
  useEffect(() => {
    setPriceRange([urlMinPrice, urlMaxPrice]);
  }, [urlMinPrice, urlMaxPrice]);

  // Check which filters are active
  const isSearchActive = !!currentSearch;
  const isCategoryActive = !!currentCategory;
  const isBrandActive = !!currentBrand;
  const isColorActive = !!currentColor;
  const isPriceActive = urlMinPrice > 0 || urlMaxPrice < 500000;
  const isInStockActive = currentInStock;

  const hasActiveFilters =
    isSearchActive ||
    isCategoryActive ||
    isBrandActive ||
    isColorActive ||
    isPriceActive ||
    isInStockActive;

  // Count active filters
  const activeFilterCount = [
    isSearchActive,
    isCategoryActive,
    isBrandActive,
    isColorActive,
    isPriceActive,
    isInStockActive,
  ].filter(Boolean).length;

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

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get("search") as string;
    updateParams({ q: searchQuery || null });
  };

  const handleClearFilters = () => {
    router.push("/products", { scroll: false });
  };

  const clearSingleFilter = (key: string) => {
    if (key === "price") {
      updateParams({ minPrice: null, maxPrice: null });
    } else {
      updateParams({ [key]: null });
    }
  };

  // Helper for filter label with active indicator
  const FilterLabel = ({
    children,
    isActive,
    filterKey,
  }: {
    children: React.ReactNode;
    isActive: boolean;
    filterKey: string;
  }) => (
    <div className="mb-2 flex items-center justify-between">
      <span
        className={`block text-xs font-bold uppercase tracking-wider ${isActive
          ? "text-zinc-900 dark:text-zinc-100"
          : "text-zinc-500 dark:text-zinc-400"
          }`}
      >
        {children}
      </span>
      {isActive && (
        <button
          type="button"
          onClick={() => clearSingleFilter(filterKey)}
          className="text-amber-500 hover:text-amber-600 flex items-center gap-1 text-[10px] font-bold uppercase"
        >
          <span>Clear</span>
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
        <FilterLabel isActive={isSearchActive} filterKey="q">
          Search
        </FilterLabel>
        <form onSubmit={handleSearchSubmit} className="relative">
          <Input
            name="search"
            placeholder="Search products..."
            defaultValue={currentSearch}
            className="pr-10 bg-zinc-50 border-zinc-100 dark:bg-zinc-800 dark:border-zinc-700 rounded-lg"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          </button>
        </form>
      </div>

      {/* Category */}
      <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
        <FilterLabel isActive={isCategoryActive} filterKey="category">
          Category
        </FilterLabel>
        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.slug}
              onClick={() => updateParams({ category: currentCategory === category.slug ? null : category.slug })}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                currentCategory === category.slug
                  ? "bg-zinc-900 text-white font-bold dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
              )}
            >
              {category.title}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
        <FilterLabel isActive={isBrandActive} filterKey="brand">
          Brands
        </FilterLabel>
        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
          {brands.map((brand) => (
            <button
              key={brand.slug}
              onClick={() => updateParams({ brand: currentBrand === brand.slug ? null : brand.slug })}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                currentBrand === brand.slug
                  ? "bg-zinc-900 text-white font-bold dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
              )}
            >
              {brand.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
        <FilterLabel isActive={isPriceActive} filterKey="price">
          Price Range
        </FilterLabel>
        <div className="px-2 pt-2">
          <Slider
            min={0}
            max={500000}
            step={5000}
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            onValueCommit={([min, max]) =>
              updateParams({
                minPrice: min > 0 ? min : null,
                maxPrice: max < 500000 ? max : null,
              })
            }
            className="mb-4"
          />
          <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase">
            <span>{priceRange[0].toLocaleString()} TZS</span>
            <span>{priceRange[1].toLocaleString()} TZS</span>
          </div>
        </div>
      </div>

      {/* Colors (Mocked common colors as placeholder) */}
      <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
        <FilterLabel isActive={isColorActive} filterKey="color">
          Colors
        </FilterLabel>
        <div className="flex flex-wrap gap-2">
          {["Black", "White", "Blue", "Red", "Brown", "Gray"].map((color) => (
            <button
              key={color}
              onClick={() => updateParams({ color: currentColor === color.toLowerCase() ? null : color.toLowerCase() })}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all p-0.5",
                currentColor === color.toLowerCase()
                  ? "border-zinc-900 dark:border-zinc-100 scale-110"
                  : "border-transparent"
              )}
            >
              <div
                className="w-full h-full rounded-full shadow-inner"
                style={{ backgroundColor: color.toLowerCase() }}
                title={color}
              />
            </button>
          ))}
        </div>
      </div>

      {/* In Stock */}
      <div className="bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
        <label className="flex cursor-pointer items-center justify-between group">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 transition-colors group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
            Show in-stock only
          </span>
          <input
            type="checkbox"
            checked={currentInStock}
            onChange={(e) =>
              updateParams({ inStock: e.target.checked ? "true" : null })
            }
            className="h-5 w-5 rounded-lg border-zinc-200 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:checked:bg-zinc-100"
          />
        </label>
      </div>

      {/* Clear All */}
      {hasActiveFilters && (
        <Button
          onClick={handleClearFilters}
          variant="outline"
          className="w-full py-6 rounded-xl border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white transition-all font-bold uppercase tracking-widest text-xs"
        >
          <X className="mr-2 h-4 w-4" />
          Reset All Filters
        </Button>
      )}
    </div>
  );
}
