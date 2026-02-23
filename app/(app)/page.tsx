import { Suspense } from "react";
import { sanityFetch } from "@/sanity/lib/live";
import {
  FEATURED_PRODUCTS_QUERY,
  FILTER_PRODUCTS_BY_NAME_QUERY,
  FILTER_PRODUCTS_BY_PRICE_ASC_QUERY,
  FILTER_PRODUCTS_BY_PRICE_DESC_QUERY,
  FILTER_PRODUCTS_BY_RELEVANCE_QUERY,
} from "@/lib/sanity/queries/products";
import { ALL_CATEGORIES_QUERY } from "@/lib/sanity/queries/categories";
// import { ALL_BRANDS_QUERY } from "@/lib/sanity/queries/brands";
import { HERO_PET_IMAGES_QUERY } from "@/lib/sanity/queries/heroImages";
import { GROOMING_IMAGES_QUERY } from "@/lib/sanity/queries/groomingImages";
import { ProductSection } from "@/components/app/ProductSection";
import { ProductShowcase } from "@/components/app/ProductShowcase";
import { FeaturedCarouselSkeleton } from "@/components/app/FeaturedCarouselSkeleton";
import { AdoptionSection } from "@/components/app/AdoptionSection";
import { GroomingSection } from "@/components/app/GroomingSection";
import { CategoryTabs } from "@/components/app/CategoryTabs";
import { AutoRotatingProductGrid } from "@/components/app/AutoRotatingProductGrid";
import { BrandsSection } from "@/components/app/BrandsSection";
import { ConsultationCTA } from "@/components/app/ConsultationCTA";
import { odoo } from "@/lib/odoo/client";

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

  // Select query based on sort parameter
  const getQuery = () => {
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

  // Fetch products with filters (server-side via GROQ)
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

  // Fetch categories for filter sidebar
  const { data: categories } = await sanityFetch({
    query: ALL_CATEGORIES_QUERY,
  });

  // Fetch featured products for carousel
  const { data: featuredProducts } = await sanityFetch({
    query: FEATURED_PRODUCTS_QUERY,
  });

  // Fetch pet category images
  const { data: petImages } = await sanityFetch({
    query: HERO_PET_IMAGES_QUERY,
  });

  // Fetch grooming section images
  const { data: groomingImages } = await sanityFetch({
    query: GROOMING_IMAGES_QUERY,
  });

  // Fetch brands from Odoo
  const brands = await odoo.getBrands();

  // Extract image URLs
  const dogImages = petImages?.dogImages?.map((img: any) => img.url).filter((url: any): url is string => !!url) ?? [];
  const catImages = petImages?.catImages?.map((img: any) => img.url).filter((url: any): url is string => !!url) ?? [];
  const birdImages = petImages?.birdImages?.map((img: any) => img.url).filter((url: any): url is string => !!url) ?? [];
  const fishImages = petImages?.fishImages?.map((img: any) => img.url).filter((url: any): url is string => !!url) ?? [];
  const groomingImageUrls = groomingImages?.map((img: any) => img.url).filter((url: any): url is string => !!url) ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* PAW Section - Main Hero */}
      <section className="pt-20"> {/* Add padding for fixed header */}
        <AdoptionSection
          dogImages={dogImages}
          catImages={catImages}
          birdImages={birdImages}
          fishImages={fishImages}
        />
      </section>

      {/* Featured Products - JoJo's Style Grid (Section 3) */}
      {featuredProducts.length > 0 && (
        <section className="py-16 md:py-24 bg-secondary/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 text-center">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground">Featured Collections</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Curated selection of our finest products.</p>
          </div>
          <Suspense fallback={<FeaturedCarouselSkeleton />}>
            <ProductShowcase products={featuredProducts} />
          </Suspense>
        </section>
      )}

      {/* Grooming Section (Section 2) */}
      <GroomingSection images={groomingImageUrls} />

      {/* All Products */}
      <section className="py-24 md:py-32 bg-background border-t border-border">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground">Explore Everything</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Everything your pet needs, all in one place.</p>
          </div>
          <AutoRotatingProductGrid products={products} />
        </div>
      </section>

      {/* Brands Section */}
      <BrandsSection brands={brands} />

      {/* Consultation CTA */}
      <ConsultationCTA />
    </div>
  );
}
