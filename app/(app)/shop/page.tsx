import React from "react";
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
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { FoodBowlIcon, BoneIcon, TeddyBearIcon, CollarIcon, ScissorsBubblesIcon } from "@/components/app/CustomIcons";
import { Metadata } from "next";
import Link from "next/link";
import { odoo } from "@/lib/odoo/client";

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
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const { q, category, brand, color, sort, minPrice, maxPrice, inStock, page } = params;
  const currentPage = parseInt(page || "1", 10);

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

  // Fetch Data in Parallel (Sanity + Odoo)
  const [productsResult, sanityCategoriesResult, brandsResult, odooCategories] = await Promise.all([
    sanityFetch({ query, params: queryParams }),
    sanityFetch({ query: ALL_CATEGORIES_QUERY }),
    sanityFetch({ query: ALL_BRANDS_QUERY }),
    odoo.getPublicCategories().catch(e => { console.error("Odoo categories fetch failed:", e); return []; })
  ]);

  const sanityProducts = productsResult.data || [];
  const sanityCategories = sanityCategoriesResult.data || [];
  const brands = brandsResult.data || [];
  
  // Fetch Odoo Products
  let odooProductsUnfiltered = [];
  try {
    odooProductsUnfiltered = await odoo.getOdooShopProducts(odooCategories || []);
  } catch (error) {
    console.error("Failed to fetch Odoo products:", error);
  }

  // Filter Odoo Products manually to match the query params
  const odooProducts = odooProductsUnfiltered.filter(p => {
    if (q && !p.name?.toLowerCase().includes(q.toLowerCase())) return false;
    if (category && !p.categories.some((c: any) => c.slug === category)) return false;
    if (inStock && p.stock <= 0) return false;
    if (minPrice && p.price < Number(minPrice)) return false;
    if (maxPrice && p.price > Number(maxPrice)) return false;
    return true;
  });

  // Merge Odoo and Sanity Categories for the filter sidebar
  const mappedOdooCategories = (odooCategories || []).map(c => ({
    _id: `odoo-cat-${c.id}`,
    title: c.name,
    displayName: c.display_name,
    slug: { current: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
  }));
  
  // Create a Map to prevent duplicate categories by slug
  const categoryMap = new Map();
  [...sanityCategories, ...mappedOdooCategories].forEach(cat => {
    const slug = cat.slug?.current || cat.slug;
    if (slug && !categoryMap.has(slug)) {
      categoryMap.set(slug, cat);
    }
  });
  const allCategories = Array.from(categoryMap.values());

  const activeCategory = category ? allCategories.find(c => (c.slug?.current || c.slug) === category) : null;
  
  // Build Breadcrumbs from Odoo display_name (e.g., "Dogs / Grooming / Nail Care")
  let breadcrumbs: string[] = [];
  let eyebrow = "SHOP";
  if (activeCategory && activeCategory.displayName) {
    breadcrumbs = activeCategory.displayName.split(' / ');
    if (breadcrumbs.length > 1) {
      eyebrow = breadcrumbs[breadcrumbs.length - 2].toUpperCase();
    }
  } else if (activeCategory) {
    breadcrumbs = [activeCategory.title];
  }

  // Merge products
  let combinedProducts = [...sanityProducts, ...odooProducts];

  // Re-sort the combined list to ensure Odoo and Sanity products are ordered correctly together
  if (sort === "price-asc") {
    combinedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sort === "price-desc") {
    combinedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sort === "name") {
    combinedProducts.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }

  // Pagination Logic
  const itemsPerPage = 8;
  const totalPages = Math.ceil(combinedProducts.length / itemsPerPage) || 1;
  
  // Ensure currentPage is within bounds
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  
  const pagedProducts = combinedProducts.slice(
    (validCurrentPage - 1) * itemsPerPage,
    validCurrentPage * itemsPerPage
  );

  // Construct baseUrl for pagination
  const urlSearchParams = new URLSearchParams();
  if (q) urlSearchParams.set("q", q);
  if (category) urlSearchParams.set("category", category);
  if (brand) urlSearchParams.set("brand", brand);
  if (sort) urlSearchParams.set("sort", sort);
  if (minPrice) urlSearchParams.set("minPrice", minPrice);
  if (maxPrice) urlSearchParams.set("maxPrice", maxPrice);
  if (inStock) urlSearchParams.set("inStock", "true");
  
  const baseSearchString = urlSearchParams.toString();
  const baseUrl = `/shop${baseSearchString ? `?${baseSearchString}&` : '?'}`;

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans pb-24 overflow-hidden">
      {/* Hero Section */}
      {activeCategory ? (
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-10 sm:px-6 lg:px-8 text-left border-b border-[#EAE3D9] mb-8">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-zinc-500 font-medium mb-10">
            <Link href="/shop" className="hover:text-zinc-900 transition-colors">Shop</Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <span>/</span>
                <span className={idx === breadcrumbs.length - 1 ? "text-zinc-900" : "hover:text-zinc-900 transition-colors"}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>
          
          <h3 className="text-xs font-bold tracking-[0.2em] text-[#c77e35] uppercase mb-4">
            {eyebrow}
          </h3>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#222222] leading-[1.1] tracking-tight mb-4 max-w-2xl">
            {activeCategory.title}
          </h1>
          <p className="text-lg text-zinc-700 font-medium">Everything for comfortable, well-kept paws.</p>
        </div>
      ) : (
        <>
          <div className="max-w-4xl mx-auto px-4 pt-16 pb-8 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-[54px] font-serif text-[#222222] leading-[1.1] tracking-tight">
              Everything they need,<br />
              chosen with care.
            </h1>
          </div>

          {/* Category Icons Strip (Only show on main shop page) */}
          <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mb-16 mt-4">
            <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-6 md:px-8">
              <Link href="/shop?category=dogs" className="flex flex-col items-center gap-1 group opacity-80 hover:opacity-100 transition-opacity px-2 sm:px-6 shrink-0 min-w-[130px]">
                <FoodBowlIcon className="w-12 h-12 text-[#4E2A15] mb-4" />
                <span className="text-[11px] font-bold tracking-widest text-[#222] uppercase">Food</span>
                <span className="text-[13px] text-zinc-500 group-hover:text-[#4E2A15] transition-colors mt-2 flex items-center gap-1">Shop now <span className="font-serif font-light text-lg relative top-[-1px]">&rarr;</span></span>
              </Link>
              <div className="w-[1px] h-20 bg-[#EAE3D9] shrink-0 hidden sm:block"></div>
              
              <Link href="/shop?category=dogs" className="flex flex-col items-center gap-1 group opacity-80 hover:opacity-100 transition-opacity px-2 sm:px-6 shrink-0 min-w-[130px]">
                <BoneIcon className="w-12 h-12 text-[#4E2A15] mb-4" />
                <span className="text-[11px] font-bold tracking-widest text-[#222] uppercase">Treats</span>
                <span className="text-[13px] text-zinc-500 group-hover:text-[#4E2A15] transition-colors mt-2 flex items-center gap-1">Shop now <span className="font-serif font-light text-lg relative top-[-1px]">&rarr;</span></span>
              </Link>
              <div className="w-[1px] h-20 bg-[#EAE3D9] shrink-0 hidden sm:block"></div>
              
              <Link href="/shop?category=dogs" className="flex flex-col items-center gap-1 group opacity-80 hover:opacity-100 transition-opacity px-2 sm:px-6 shrink-0 min-w-[130px]">
                <TeddyBearIcon className="w-12 h-12 text-[#4E2A15] mb-4" />
                <span className="text-[11px] font-bold tracking-widest text-[#222] uppercase">Toys</span>
                <span className="text-[13px] text-zinc-500 group-hover:text-[#4E2A15] transition-colors mt-2 flex items-center gap-1">Shop now <span className="font-serif font-light text-lg relative top-[-1px]">&rarr;</span></span>
              </Link>
              <div className="w-[1px] h-20 bg-[#EAE3D9] shrink-0 hidden sm:block"></div>
              
              <Link href="/shop?category=dogs" className="flex flex-col items-center gap-1 group opacity-80 hover:opacity-100 transition-opacity px-2 sm:px-6 shrink-0 min-w-[130px]">
                <CollarIcon className="w-12 h-12 text-[#4E2A15] mb-4" />
                <span className="text-[11px] font-bold tracking-widest text-[#222] uppercase">Accessories</span>
                <span className="text-[13px] text-zinc-500 group-hover:text-[#4E2A15] transition-colors mt-2 flex items-center gap-1">Shop now <span className="font-serif font-light text-lg relative top-[-1px]">&rarr;</span></span>
              </Link>
              <div className="w-[1px] h-20 bg-[#EAE3D9] shrink-0 hidden sm:block"></div>
              
              <Link href="/grooming" className="flex flex-col items-center gap-1 group opacity-80 hover:opacity-100 transition-opacity px-2 sm:px-6 shrink-0 min-w-[130px]">
                <ScissorsBubblesIcon className="w-12 h-12 text-[#4E2A15] mb-4" />
                <span className="text-[11px] font-bold tracking-widest text-[#222] uppercase">Grooming</span>
                <span className="text-[13px] text-zinc-500 group-hover:text-[#4E2A15] transition-colors mt-2 flex items-center gap-1">Book now <span className="font-serif font-light text-lg relative top-[-1px]">&rarr;</span></span>
              </Link>
            </div>
          </div>
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Controls Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-serif text-[#222222] mb-1">All Products</h2>
            <p className="text-sm text-zinc-500 font-medium">Showing {combinedProducts.length} products</p>
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
                <ProductFilters categories={allCategories} brands={brands} />
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
          <ProductGrid 
            products={pagedProducts} 
            currentPage={validCurrentPage} 
            totalPages={totalPages} 
            baseUrl={baseUrl} 
          />
        </main>
      </div>
    </div>
  );
}
