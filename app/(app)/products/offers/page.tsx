import { sanityFetch } from "@/sanity/lib/live";
import {
  OFFERS_BY_NAME_QUERY,
  OFFERS_BY_PRICE_ASC_QUERY,
  OFFERS_BY_PRICE_DESC_QUERY,
  OFFERS_BY_RELEVANCE_QUERY,
} from "@/lib/sanity/queries/products";
import { ALL_CATEGORIES_QUERY } from "@/lib/sanity/queries/categories";
import { ProductSection } from "@/components/app/ProductSection";
import { Home } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    color?: string;
    material?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    inStock?: string;
  }>;
}

export default async function OffersPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const searchQuery = params.q ?? "";
  const categorySlug = params.category ?? "";
  const color = params.color ?? "";
  const material = params.material ?? "";
  const minPrice = Number(params.minPrice) || 0;
  const maxPrice = Number(params.maxPrice) || 0;
  const sort = params.sort ?? "popular";
  const inStock = params.inStock === "true";

  const getQuery = () => {
    if (searchQuery && sort === "relevance") {
      return OFFERS_BY_RELEVANCE_QUERY;
    }
    switch (sort) {
      case "price_asc":
        return OFFERS_BY_PRICE_ASC_QUERY;
      case "price_desc":
        return OFFERS_BY_PRICE_DESC_QUERY;
      case "rated":
        return OFFERS_BY_NAME_QUERY;
      case "popular":
        return OFFERS_BY_RELEVANCE_QUERY;
      default:
        return OFFERS_BY_NAME_QUERY;
    }
  };

  const { data: products } = await sanityFetch({
    query: getQuery(),
    params: {
      searchQuery,
      categorySlug,
      color,
      material,
      minPrice,
      maxPrice,
      inStock,
    },
  });

  const { data: categories } = await sanityFetch({
    query: ALL_CATEGORIES_QUERY,
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#6b3e1e] text-white py-16 px-4 text-center">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4 text-amber-400 font-bold uppercase tracking-widest text-xs">
            <Badge className="bg-amber-500 text-white border-none shadow-lg">New Offers</Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Exclusive Offers</h1>
          <p className="max-w-2xl mx-auto opacity-90 text-lg leading-relaxed">
            Discover premium pet supplies and treats at special prices. Your pets deserve the best, and we make it affordable.
          </p>
        </div>
      </section>

      {/* Breadcrumbs - Refined */}
      <div className="border-b border-zinc-100 bg-zinc-50/50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-3 text-xs font-medium tracking-wide text-zinc-500">
          <Link href="/" className="hover:text-[#6b3e1e] transition-colors flex items-center gap-1">
            <Home className="h-3.5 w-3.5" /> Home
          </Link>
          <span className="text-zinc-300">/</span>
          <Link href="/products" className="hover:text-[#6b3e1e] transition-colors">Products</Link>
          <span className="text-zinc-300">/</span>
          <span className="text-[#6b3e1e] font-bold uppercase tracking-widest">Offers</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-xl font-bold text-zinc-900 mb-1">Browse Our Specials</h2>
          <p className="text-sm text-zinc-500 italic">Showing {products.length} exclusive deals</p>
        </div>

        <ProductSection
          categories={categories}
          products={products}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}
