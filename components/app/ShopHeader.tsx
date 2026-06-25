"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ProductFilters } from "./ProductFilters";

interface ShopHeaderProps {
    categories: any[];
    brands: any[];
    productCount: number;
    searchQuery?: string;
}

function ShopHeaderInner({ categories, brands, productCount, searchQuery }: ShopHeaderProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentSort = searchParams.get("sort") || "name";
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");

    const activeFilters = [
        { key: "category", value: category, label: categories.find(c => c.slug === category)?.title },
        { key: "brand", value: brand, label: brands.find(b => b.slug === brand)?.name },
    ].filter(f => f.value && f.label);

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", value);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const removeFilter = (key: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete(key);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="space-y-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                        {searchQuery ? `Results for "${searchQuery}"` : "Our Shop"}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    {/* Mobile Filter Trigger */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="h-11 px-5 rounded-xl border-zinc-200 shadow-sm hover:bg-zinc-50 transition-all flex gap-2">
                                    <SlidersHorizontal className="h-4 w-4 text-amber-600" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Filters</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[320px] p-0 overflow-y-auto">
                                <div className="p-6">
                                    <SheetHeader className="mb-6">
                                        <SheetTitle className="text-2xl font-black italic text-zinc-900">FILTERS</SheetTitle>
                                    </SheetHeader>
                                    <ProductFilters categories={categories} brands={brands} />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Desktop Sort Dropdown */}
                    <Select value={currentSort} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-[180px] h-11 rounded-xl border-zinc-200 shadow-sm bg-white/70 backdrop-blur-md focus:ring-amber-500">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase text-zinc-400">Sort:</span>
                                <SelectValue placeholder="Sort by" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-zinc-100 shadow-xl">
                            <SelectItem value="name" className="text-sm font-medium">Name (A-Z)</SelectItem>
                            <SelectItem value="relevance" className="text-sm font-medium">Relevance</SelectItem>
                            <SelectItem value="price-asc" className="text-sm font-medium">Price: Low to High</SelectItem>
                            <SelectItem value="price-desc" className="text-sm font-medium">Price: High to Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Active Filters Row */}
            {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-500">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mr-2">Active Filters:</span>
                    {activeFilters.map((filter) => (
                        <Badge
                            key={filter.key}
                            variant="secondary"
                            className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm group"
                        >
                            {filter.label}
                            <button
                                onClick={() => removeFilter(filter.key)}
                                className="hover:text-amber-900 p-0.5 rounded-full hover:bg-amber-300/50 transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                    <button
                        onClick={() => router.push("/shop", { scroll: false })}
                        className="text-[10px] font-bold text-zinc-400 uppercase hover:text-amber-600 transition-colors ml-2"
                    >
                        Clear All
                    </button>
                </div>
            )}
        </div>
    );
}

export function ShopHeader(props: ShopHeaderProps) {
    return (
        <Suspense fallback={null}>
            <ShopHeaderInner {...props} />
        </Suspense>
    );
}
