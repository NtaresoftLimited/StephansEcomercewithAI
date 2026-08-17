import { PackageSearch, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: any[];
  currentPage?: number;
  totalPages?: number;
  baseUrl?: string;
}

export function ProductGrid({ 
  products, 
  currentPage = 1, 
  totalPages = 1, 
  baseUrl = "/shop?" 
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="min-h-[400px] rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
        <EmptyState
          icon={PackageSearch}
          title="No products found"
          description="Try adjusting your search or filters to find what you're looking for"
          size="lg"
        />
      </div>
    );
  }

  // Generate pagination links
  const getPageUrl = (page: number) => {
    return `${baseUrl}page=${page}`;
  };

  return (
    <div className="@container">
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-x-6 sm:gap-y-14">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-24 flex items-center justify-center gap-3">
          {currentPage > 1 ? (
            <Link 
              href={getPageUrl(currentPage - 1)}
              className="w-10 h-10 rounded-full border border-[#EAE3D9] flex items-center justify-center text-zinc-400 hover:text-zinc-800 hover:border-zinc-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
          ) : (
            <button disabled className="w-10 h-10 rounded-full border border-[#EAE3D9] flex items-center justify-center text-zinc-300 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          
          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            // Only show limited pages logic can go here if totalPages is huge, 
            // but for simple cases we just show them if it's small, or use ellipsis
            if (totalPages > 5 && page > 3 && page !== totalPages && page !== currentPage) {
               if (page === 4 && currentPage > 4) return <span key={page} className="w-10 flex items-center justify-center text-zinc-400">...</span>;
               if (page === totalPages - 1 && currentPage < totalPages - 2) return <span key={page} className="w-10 flex items-center justify-center text-zinc-400">...</span>;
               if (Math.abs(currentPage - page) > 1) return null;
            }

            const isActive = page === currentPage;

            return (
              <Link 
                key={page}
                href={getPageUrl(page)}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-colors",
                  isActive 
                    ? "bg-[#4E2A15] text-white" 
                    : "text-zinc-600 hover:bg-black/5"
                )}
              >
                {page}
              </Link>
            );
          })}

          {currentPage < totalPages ? (
            <Link 
              href={getPageUrl(currentPage + 1)}
              className="w-10 h-10 rounded-full border border-[#EAE3D9] flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:border-zinc-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <button disabled className="w-10 h-10 rounded-full border border-[#EAE3D9] flex items-center justify-center text-zinc-300 cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
