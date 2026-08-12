import { PackageSearch, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/ui/empty-state";
// import type { FILTER_PRODUCTS_BY_NAME_QUERYResult } from "@/sanity.types";

interface ProductGridProps {
  products: any[];
}

export function ProductGrid({ products }: ProductGridProps) {
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

  const itemsPerPage = 12;
  const totalPages = Math.ceil(products.length / itemsPerPage) || 1;
  const displayProducts = products.slice(0, itemsPerPage);

  return (
    <div className="@container">
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-x-6 sm:gap-y-14">
        {displayProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-24 flex items-center justify-center gap-3">
        <button className="w-10 h-10 rounded-full border border-[#EAE3D9] flex items-center justify-center text-zinc-400 hover:text-zinc-800 hover:border-zinc-300 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <button className="w-10 h-10 rounded-full bg-[#4E2A15] text-white flex items-center justify-center font-medium text-sm">
          1
        </button>
        
        {totalPages > 1 && (
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-600 font-medium text-sm hover:bg-black/5 transition-colors">
            2
          </button>
        )}
        {totalPages > 2 && (
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-600 font-medium text-sm hover:bg-black/5 transition-colors">
            3
          </button>
        )}
        {totalPages > 3 && (
          <span className="w-10 flex items-center justify-center text-zinc-400">...</span>
        )}

        <button className="w-10 h-10 rounded-full border border-[#EAE3D9] flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:border-zinc-300 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
