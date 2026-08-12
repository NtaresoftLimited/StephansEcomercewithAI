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
import { ProductFilters } from "@/components/app/ProductFilters";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, ChevronDown, Beef, Bone, Smile, Tag, Scissors } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

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
    <div className="min-h-screen bg-[#FAF7F2] font-sans pb-24 overflow-hidden">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-12 sm:px-6 lg:px-8 text-left">
        <h3 className="text-xs font-bold tracking-widest text-zinc-900 uppercase mb-6">Shop</h3>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#222222] leading-[1.1] tracking-tight mb-4 max-w-2xl">
          Everything they need,<br className="hidden sm:block" />
          chosen with care.
        </h1>
        <p className="text-lg text-zinc-800 font-medium">For the life you share with them.</p>
      </div>

      {/* Category Icons Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex items-center justify-start gap-8 sm:gap-16 md:gap-24 overflow-x-auto no-scrollbar pb-6 border-b border-[#EAE3D9]">
          <Link href="/shop?category=dogs" className="flex flex-col items-center gap-3 group opacity-70 hover:opacity-100 transition-opacity">
            <Beef className="w-10 h-10 text-[#4E2A15] stroke-[1.5]" />
            <span className="text-sm font-semibold text-[#4E2A15]">Food</span>
          </Link>
          <Link href="/shop?category=dogs" className="flex flex-col items-center gap-3 group opacity-70 hover:opacity-100 transition-opacity">
            <Bone className="w-10 h-10 text-[#4E2A15] stroke-[1.5]" />
            <span className="text-sm font-semibold text-[#4E2A15]">Treats</span>
          </Link>
          <Link href="/shop?category=dogs" className="flex flex-col items-center gap-3 group opacity-70 hover:opacity-100 transition-opacity">
            <Smile className="w-10 h-10 text-[#4E2A15] stroke-[1.5]" />
            <span className="text-sm font-semibold text-[#4E2A15]">Toys</span>
          </Link>
          <Link href="/shop?category=dogs" className="flex flex-col items-center gap-3 group opacity-70 hover:opacity-100 transition-opacity">
            <Tag className="w-10 h-10 text-[#4E2A15] stroke-[1.5]" />
            <span className="text-sm font-semibold text-[#4E2A15]">Accessories</span>
          </Link>
          <Link href="/grooming" className="flex flex-col items-center gap-3 group opacity-70 hover:opacity-100 transition-opacity">
            <div className="relative w-10 h-10">
              <Image src="/icons/Grooming Scissors.png" alt="Grooming" fill className="object-contain" />
            </div>
            <span className="text-sm font-semibold text-[#4E2A15]">Grooming</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Controls Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-serif text-[#222222] mb-1">All Products</h2>
            <p className="text-sm text-zinc-500 font-medium">Showing {products.length} products</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex-1 sm:flex-none border-[#EAE3D9] bg-transparent hover:bg-white rounded-full h-10 px-6 flex items-center gap-2 text-[#4E2A15]">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="font-semibold text-sm">Filter</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <SheetHeader className="mb-6">
                  <SheetTitle className="font-serif text-2xl">Filters</SheetTitle>
                </SheetHeader>
                <ProductFilters categories={categories} brands={brands} />
              </SheetContent>
            </Sheet>

            <Button variant="outline" className="flex-1 sm:flex-none border-[#EAE3D9] bg-transparent hover:bg-white rounded-full h-10 px-6 flex items-center justify-between gap-3 min-w-[200px] text-[#4E2A15]">
              <span className="font-semibold text-sm">Sort by: <span className="font-normal">Featured</span></span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <main className="w-full">
          <ProductGrid products={products} />
        </main>
      </div>
    </div>
  );
}
