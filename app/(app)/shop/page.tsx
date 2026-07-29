import { sanityFetch } from "@/sanity/lib/live";
import {
  ALL_CATEGORIES_QUERY
} from "@/lib/sanity/queries/categories";
import {
  ALL_BRANDS_QUERY
} from "@/lib/sanity/queries/brands";
import {
  FILTER_PRODUCTS_BY_NAME_QUERY,
  FILTER_PRODUCTS_BY_PRICE_ASC_QUERY,
  FILTER_PRODUCTS_BY_PRICE_DESC_QUERY,
  FILTER_PRODUCTS_BY_RELEVANCE_QUERY
} from "@/lib/sanity/queries/products";
import { ProductGrid } from "@/components/app/ProductGrid";
import { ShopHeader } from "@/components/app/ShopHeader";
import { ProductFilters } from "@/components/app/ProductFilters";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { Metadata } from "next";
import { ProductsBanner } from "@/components/app/ProductsBanner";

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const category = params?.category;
  
  if (category) {
    const formattedCategory = category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const rootCategoryTitles: Record<string, string> = {
      dogs: "Dog Supplies",
      cats: "Cat Supplies",
      birds: "Bird Supplies",
      "small-pets": "Small Pet Supplies",
    };
    const titleCategory = rootCategoryTitles[category] ?? formattedCategory;

    return {
      title: `${rootCategoryTitles[category] ? titleCategory : `Buy ${titleCategory}`} in Dar es Salaam`,
      description: `Shop premium ${titleCategory.toLowerCase()} and other pet supplies at Stephan's Pet Store in Dar es Salaam. Fast delivery available!`,
      alternates: {
        canonical: `/shop?category=${category}`,
      },
    };
  }

  return {
    title: "Pet Shop Dar es Salaam | Pet Food, Accessories & Supplies",
    description: "Shop pet food, beds, toys, grooming products and accessories in Dar es Salaam. Stephan's Pet Store offers premium supplies for dogs, cats, birds and small pets.",
    alternates: {
      canonical: "/shop",
    },
  };
}

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    brand?: string;
    color?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const { q, category, brand, color, sort, minPrice, maxPrice, inStock } = params;

  // Prepare Query Parameters
  const queryParams = {
    searchQuery: q || "",
    categorySlug: category || "",
    brandSlug: brand || "",
    minPrice: minPrice ? Number(minPrice) : 0,
    maxPrice: maxPrice ? Number(maxPrice) : 0,
    inStock: inStock === "true",
    color: color || "",
    material: "", // Default
  };

  // Determine which query to use based on sort
  let query: any = FILTER_PRODUCTS_BY_NAME_QUERY;

  if (q) query = FILTER_PRODUCTS_BY_RELEVANCE_QUERY;
  if (sort === "price-asc") query = FILTER_PRODUCTS_BY_PRICE_ASC_QUERY;
  else if (sort === "price-desc") query = FILTER_PRODUCTS_BY_PRICE_DESC_QUERY;
  else if (sort === "relevance") query = FILTER_PRODUCTS_BY_RELEVANCE_QUERY;
  else if (sort === "name") query = FILTER_PRODUCTS_BY_NAME_QUERY;

  // Fetch Data in Parallel
  const [productsResult, categoriesResult, brandsResult] = await Promise.all([
    sanityFetch({ query, params: queryParams }),
    sanityFetch({ query: ALL_CATEGORIES_QUERY }),
    sanityFetch({ query: ALL_BRANDS_QUERY }),
  ]);

  const products = productsResult.data || [];
  const categories = categoriesResult.data || [];
  const brands = brandsResult.data || [];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <ProductsBanner />
      
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <ShopHeader 
          categories={categories} 
          brands={brands} 
          productCount={products.length} 
          searchQuery={q}
        />
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Desktop Filters */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-24">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Filters</h2>
              <ProductFilters categories={categories} brands={brands} />
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
