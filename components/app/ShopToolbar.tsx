"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { 
  Search, 
  ChevronDown
} from "lucide-react";

interface ShopToolbarProps {
  totalCount: number;
  currentSort?: string;
  itemsPerPage?: number;
}

export function ShopToolbar({
  totalCount,
  currentSort = "relevance",
  itemsPerPage = 8,
}: ShopToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
      <div className="flex min-w-0 items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-36 sm:w-48 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 pl-8 text-xs outline-none focus:border-[#7E22CE] dark:focus:border-purple-400 transition-colors"
          />
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
        </form>
        <span className="hidden text-xs text-zinc-500 md:inline">{totalCount.toLocaleString()} products</span>
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
