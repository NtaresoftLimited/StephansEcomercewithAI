import { Suspense } from "react";
import Link from "next/link";
import { sanityFetch } from "@/sanity/lib/live";
import {
  FILTER_PRODUCTS_BY_NAME_QUERY,
  FILTER_PRODUCTS_BY_PRICE_ASC_QUERY,
  FILTER_PRODUCTS_BY_PRICE_DESC_QUERY,
  FILTER_PRODUCTS_BY_RELEVANCE_QUERY,
  NEW_ARRIVALS_QUERY,
} from "@/lib/sanity/queries/products";
import { ALL_CATEGORIES_QUERY } from "@/lib/sanity/queries/categories";
import { HERO_PET_IMAGES_QUERY } from "@/lib/sanity/queries/heroImages";
import { GROOMING_IMAGES_QUERY } from "@/lib/sanity/queries/groomingImages";
import { HeroSection } from "@/components/app/HeroSection";
import { PetCategoryStrip } from "@/components/app/PetCategoryStrip";
import { GroomingSection } from "@/components/app/GroomingSection";
import { AutoRotatingProductGrid } from "@/components/app/AutoRotatingProductGrid";
import { ReviewsSection } from "@/components/app/ReviewsSection";
import { BrandsSection } from "@/components/app/BrandsSection";
import { CategoryNavigationSection } from "@/components/app/CategoryNavigationSection";

import { NewsletterSection } from "@/components/app/grooming/NewsletterSection";

export const revalidate = 3600;

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

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;

  const searchQuery = params.q ?? "";
  const categorySlug = params.category ?? "";
  const color = params.color ?? "";
  const material = params.material ?? "";
  const minPrice = Number(params.minPrice) || 0;
  const maxPrice = Number(params.maxPrice) || 0;
  const sort = params.sort ?? "name";
  const inStock = params.inStock === "true";

  const isDefaultView = !searchQuery && !categorySlug && !color && !material && !minPrice && !maxPrice;

  // Select query based on sort parameter
  const getQuery = () => {
    if (isDefaultView) {
      return NEW_ARRIVALS_QUERY;
    }
    // If searching and sort is relevance, use relevance query
    if (searchQuery && sort === "relevance") {
      return FILTER_PRODUCTS_BY_RELEVANCE_QUERY;
    }

    switch (sort) {
      case "price_asc":
        return FILTER_PRODUCTS_BY_PRICE_ASC_QUERY;
      case "price_desc":
        return FILTER_PRODUCTS_BY_PRICE_DESC_QUERY;
      case "relevance":
        return FILTER_PRODUCTS_BY_RELEVANCE_QUERY;
      default:
        return FILTER_PRODUCTS_BY_NAME_QUERY;
    }
  };

  // Fetch products with filters (server-side via GROQ) with error handling
  let products = await sanityFetch({
    query: getQuery(),
    params: {
      searchQuery,
      categorySlug,
      brandSlug: "",
      color,
      material,
      minPrice,
      maxPrice,
      inStock,
    },
  }).then((r: any) => r?.data as any[]).catch(() => [] as any[]);

  // If no search params are provided, it means we are showing default "New Arrivals"
  // The user requested that these products should not be from the same brand or categories.
  // We will filter the products to ensure diversity.
  if (isDefaultView && products.length > 0) {
    const diverseProducts: any[] = [];
    const seenBrands = new Set<string>();
    const seenCategories = new Set<string>();

    for (const product of products) {
      const brandId = product.brand?._id || product.brand?.slug;
      const categoryId = product.categories?.[0]?._id || product.categories?.[0]?.slug;

      // Check if we already have this brand or category
      const isDuplicateBrand = brandId && seenBrands.has(brandId);
      const isDuplicateCategory = categoryId && seenCategories.has(categoryId);

      if (!isDuplicateBrand && !isDuplicateCategory) {
        diverseProducts.push(product);
        if (brandId) seenBrands.add(brandId);
        if (categoryId) seenCategories.add(categoryId);
      }
    }

    // If for some reason we filtered out too many and have less than 4, 
    // we can fill back up with some of the ones we skipped to keep the grid full.
    if (diverseProducts.length < 8) {
      for (const product of products) {
        if (!diverseProducts.find(p => p._id === product._id)) {
          diverseProducts.push(product);
          if (diverseProducts.length >= 8) break;
        }
      }
    }

    products = diverseProducts;
  }

  // Fetch categories, pet images, and grooming images in parallel
  const [categories, petImages, groomingImages] = await Promise.all([
    sanityFetch({ query: ALL_CATEGORIES_QUERY })
      .then((r: any) => r?.data as any[])
      .catch(() => [] as any[]),
    sanityFetch({ query: HERO_PET_IMAGES_QUERY })
      .then((r: any) => r?.data)
      .catch(() => null),
    sanityFetch({ query: GROOMING_IMAGES_QUERY })
      .then((r: any) => r?.data as any[])
      .catch(() => [] as any[]),
  ]);

  // Extract image URLs
  const dogImages = petImages?.dogImages?.map((img: any) => img.url).filter((url: any): url is string => !!url) ?? [];
  const catImages = petImages?.catImages?.map((img: any) => img.url).filter((url: any): url is string => !!url) ?? [];
  const birdImages = petImages?.birdImages?.map((img: any) => img.url).filter((url: any): url is string => !!url) ?? [];
  const fishImages = petImages?.fishImages?.map((img: any) => img.url).filter((url: any): url is string => !!url) ?? [];
  const groomingImageUrls = groomingImages?.map((img: any) => img.url).filter((url: any): url is string => !!url) ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Main Hero */}
      <section className="w-full">
        <Suspense fallback={<div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-12 text-center text-muted-foreground">Loading hero content…</div>}>
          <HeroSection />
        </Suspense>
      </section>

      <PetCategoryStrip />

      {/* All Products */}
      <section className="py-16 md:py-24 bg-background border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h3 className="text-[11px] font-bold tracking-[0.15em] text-[#c77e35] uppercase mb-4">
              NEW ARRIVALS
            </h3>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#222222] leading-tight">
              Something new, thoughtfully chosen.
            </h2>
          </div>
          <AutoRotatingProductGrid products={products} />
          
          <div className="mt-12 flex justify-center">
            <Link href="/shop" className="inline-flex items-center justify-center px-8 py-3 rounded-md border border-[#dddddd] hover:border-[#222222] transition-colors text-sm font-semibold text-[#222222] gap-2">
              View All Products
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Category Navigation Section */}
      <CategoryNavigationSection />

      {/* Grooming Section */}
      <Suspense fallback={<div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-12 text-center text-muted-foreground">Loading grooming content…</div>}>
        <GroomingSection images={groomingImageUrls} />
      </Suspense>

      <ReviewsSection />
      <NewsletterSection />
    </div>
  );
}
