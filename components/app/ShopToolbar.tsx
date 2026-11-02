"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { 
  List, 
  Grid2X2, 
  LayoutGrid, 
  Search, 
  ChevronDown,
  SlidersHorizontal 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShopToolbarProps {
  totalCount: number;
  currentSort?: string;
  itemsPerPage?: number;
  onViewChange?: (view: "list" | "grid-2" | "grid-4") => void;
  activeView?: "list" | "grid-2" | "grid-4";
}

export function ShopToolbar({
  totalCount,
  currentSort = "relevance",
  itemsPerPage = 8,
  onViewChange,
  activeView = "grid-4",
}: ShopToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // reset page
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("q", searchTerm);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 mb-6 shadow-none">
      {/* Left side: View switchers & Search */}
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5">
          <button
            type="button"
            onClick={() => onViewChange?.("list")}
            aria-label="List view"
            className={cn(
              "p-1.5 rounded-md transition-colors",
              activeView === "list"
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            )}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange?.("grid-2")}
            aria-label="2-column grid view"
            className={cn(
              "p-1.5 rounded-md transition-colors",
              activeView === "grid-2"
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            )}
          >
            <Grid2X2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange?.("grid-4")}
            aria-label="4-column grid view"
            className={cn(
              "p-1.5 rounded-md transition-colors",
              activeView === "grid-4"
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>

        {/* Search bar / trigger */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center ml-2">
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-36 sm:w-48 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 pl-8 text-xs outline-none focus:border-[#7E22CE] dark:focus:border-purple-400 transition-colors"
          />
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
        </form>
      </div>

      {/* Right side: Sort & Items Per Page Dropdowns */}
      <div className="flex items-center justify-end gap-3 text-xs">
        {/* Sort Dropdown */}
        <div className="relative flex items-center">
          <select
            value={currentSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="appearance-none bg-transparent pr-7 pl-2 py-1.5 font-medium text-zinc-800 dark:text-zinc-200 cursor-pointer outline-none hover:text-zinc-900 dark:hover:text-white"
          >
            <option value="relevance">Sort by Popularity</option>
            <option value="name">Sort by Name</option>
            <option value="price-asc">Sort by Price: Low to High</option>
            <option value="price-desc">Sort by Price: High to Low</option>
          </select>
          <ChevronDown className="absolute right-1.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
        </div>

        <span className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />

        {/* Show items count dropdown */}
        <div className="relative flex items-center">
          <select
            defaultValue={itemsPerPage}
            onChange={(e) => updateParam("limit", e.target.value)}
            className="appearance-none bg-transparent pr-7 pl-2 py-1.5 font-medium text-zinc-800 dark:text-zinc-200 cursor-pointer outline-none hover:text-zinc-900 dark:hover:text-white"
          >
            <option value="8">Show 8</option>
            <option value="12">Show 12</option>
            <option value="24">Show 24</option>
            <option value="36">Show 36</option>
          </select>
          <ChevronDown className="absolute right-1.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
