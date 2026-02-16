import { sanityFetch } from "@/sanity/lib/live";
import { 
  ALL_CATEGORIES_QUERY 
} from "@/lib/sanity/queries/categories";
import { 
  FILTER_PRODUCTS_BY_NAME_QUERY,
  FILTER_PRODUCTS_BY_PRICE_ASC_QUERY,
  FILTER_PRODUCTS_BY_PRICE_DESC_QUERY,
  FILTER_PRODUCTS_BY_RELEVANCE_QUERY
} from "@/lib/sanity/queries/products";
import { ProductGrid } from "@/components/app/ProductGrid";
import { ProductFilters } from "@/components/app/ProductFilters";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products | Stephan's Pet Store",
  description: "Browse our collection of pet products",
};

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const { q, category, sort, minPrice, maxPrice, inStock } = params;

  // Prepare Query Parameters
  const queryParams = {
    searchQuery: q || "",
    categorySlug: category || "",
    minPrice: minPrice ? Number(minPrice) : 0,
    maxPrice: maxPrice ? Number(maxPrice) : 0,
    inStock: inStock === "true",
    color: "", // Default
    material: "", // Default
  };

  // Determine which query to use based on sort
  let query: any = FILTER_PRODUCTS_BY_NAME_QUERY; // Default sort: Name A-Z

  if (q) {
    query = FILTER_PRODUCTS_BY_RELEVANCE_QUERY; // Default search sort: Relevance
  }

  if (sort === "price-asc") {
    query = FILTER_PRODUCTS_BY_PRICE_ASC_QUERY;
  } else if (sort === "price-desc") {
    query = FILTER_PRODUCTS_BY_PRICE_DESC_QUERY;
  } else if (sort === "relevance") {
    query = FILTER_PRODUCTS_BY_RELEVANCE_QUERY;
  } else if (sort === "name") {
    query = FILTER_PRODUCTS_BY_NAME_QUERY;
  }

  // Fetch Data in Parallel
  const [productsResult, categoriesResult] = await Promise.all([
    sanityFetch({ query, params: queryParams }),
    sanityFetch({ query: ALL_CATEGORIES_QUERY }),
  ]);

  const products = productsResult.data || [];
  const categories = categoriesResult.data || [];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {q ? `Search results for "${q}"` : "All Products"}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {products.length} {products.length === 1 ? "product" : "products"} found
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Mobile Filter Trigger */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </span>
                  {/* Optional: Add active filter count badge here */}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <ProductFilters categories={categories} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-24">
               <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Filters</h2>
               <ProductFilters categories={categories} />
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
             <ProductGrid products={products} />
          </main>
        </div>
      </div>
    </div>
  );
}
