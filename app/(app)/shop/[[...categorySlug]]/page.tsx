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
import { cleanCatalogProducts } from "@/lib/catalog/clean-products";
import { ProductGrid } from "@/components/app/ProductGrid";
import { ProductFilters } from "@/components/app/ProductFilters";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { FoodBowlIcon, BoneIcon, TeddyBearIcon, CollarIcon, ScissorsBubblesIcon } from "@/components/app/CustomIcons";
import { Metadata } from "next";
import Link from "next/link";
import { odoo } from "@/lib/odoo/client";

export async function generateMetadata(props: ProductsPageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const pathParams = await props.params;
  
  // Use path parameter if it exists, otherwise use search param
  const categoryParam = (pathParams?.categorySlug?.[0]) || searchParams?.category;
  
  if (categoryParam) {
    const formattedCategory = categoryParam.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const rootCategoryTitles: Record<string, string> = {
      dogs: "Dog Supplies",
      cats: "Cat Supplies",
      birds: "Bird Supplies",
      "small-pets": "Small Pet Supplies",
    };
    
    const title = rootCategoryTitles[categoryParam] 
      ? `${rootCategoryTitles[categoryParam]} - Food, Toys & Accessories | Stephan's`
      : `${formattedCategory} Products | Stephan's Pet Store`;
      
    return {
      title,
      description: `Shop our wide selection of ${formattedCategory} products. Find the best food, toys, and accessories for your pet at Stephan's.`,
      alternates: {
        canonical: `/shop/${categoryParam}`,
      },
    };
  }

  return {
    title: "All Products - Food, Toys, Beds & Accessories | Stephan's",
    description: "Browse our complete catalog of pet supplies. From premium nutrition to cozy beds and fun toys, find exactly what your pet needs.",
    alternates: {
      canonical: "/shop",
    },
  };
}

interface ProductsPageProps {
  params: Promise<{
    categorySlug?: string[];
  }>;
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

export default async function ProductsPage(props: ProductsPageProps) {
  const searchParams = await props.searchParams;
  const pathParams = await props.params;
  
  const { q, brand, color, sort, minPrice, maxPrice, inStock, page } = searchParams;
  const category = (pathParams?.categorySlug?.[0]) || searchParams.category;
  
  const currentPage = parseInt(page || "1", 10);

  // Prepare Query Parameters
  const queryParams: any = {
    searchQuery: q || "",
    categorySlug: category || "",
    categoryLeafSlug: "",
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

  // Fetch Data in Parallel (Sanity + Odoo Categories)
  const [sanityCategoriesResult, brandsResult, odooCategories] = await Promise.all([
    sanityFetch({ query: ALL_CATEGORIES_QUERY }),
    sanityFetch({ query: ALL_BRANDS_QUERY }),
    odoo.getPublicCategories().catch(e => { console.error("Odoo categories fetch failed:", e); return []; })
  ]);

  const sanityCategories = sanityCategoriesResult.data || [];
  const brands = brandsResult.data || [];

  // Merge Odoo and Sanity Categories for the filter sidebar
  const mappedOdooCategories = (odooCategories || []).map((c: any) => {
    let parentCategory = null;
    if (c.parent_id && Array.isArray(c.parent_id)) {
        const parentId = c.parent_id[0];
        const parentOdooCat = odooCategories.find((oc: any) => oc.id === parentId);
        if (parentOdooCat) {
            parentCategory = {
                title: parentOdooCat.name,
                slug: { current: (parentOdooCat.display_name || parentOdooCat.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }
            };
        }
    }
    return {
        _id: `odoo-cat-${c.id}`,
        title: c.name,
        displayName: c.display_name,
        slug: { current: (c.display_name || c.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') },
        parentCategory
    };
  });
  
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
  
  // Calculate leaf slug for Sanity since Sanity only stores leaf category names
  const leafSlug = activeCategory ? activeCategory.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : category;
  queryParams.categorySlug = category || "";
  queryParams.categoryLeafSlug = leafSlug || "";
  
  // Fetch Sanity Products using the resolved leaf slug
  const productsResult = await sanityFetch({ query, params: queryParams });
  const sanityProducts = productsResult.data || [];

  // Fetch Odoo Products
  let odooProductsUnfiltered: any[] = [];
  try {
    odooProductsUnfiltered = await odoo.getOdooShopProducts(odooCategories || []);
  } catch (error) {
    console.error("Failed to fetch Odoo products:", error);
  }

  // Filter Odoo Products manually to match the query params
  const odooProducts = odooProductsUnfiltered.filter((p: any) => {
    if (q && !p.name?.toLowerCase().includes(q.toLowerCase())) return false;
    if (category) { const t = category.endsWith('s') ? category.slice(0,-1) : category; if (!p.categories.some((c: any) => c.slug === category || c.slug.includes(t) || c.title?.toLowerCase().includes(t)) && !p.name?.toLowerCase().includes(t)) return false; }
    if (inStock && p.stock <= 0) return false;
    if (minPrice && p.price < Number(minPrice)) return false;
    if (maxPrice && p.price > Number(maxPrice)) return false;
    return true;
  });
  
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
  let combinedProducts = cleanCatalogProducts([...sanityProducts, ...odooProducts]);

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
  if (brand) urlSearchParams.set("brand", brand);
  if (sort) urlSearchParams.set("sort", sort);
  if (minPrice) urlSearchParams.set("minPrice", minPrice);
  if (maxPrice) urlSearchParams.set("maxPrice", maxPrice);
  if (inStock) urlSearchParams.set("inStock", "true");
  
  const baseSearchString = urlSearchParams.toString();
  
  // If there's a category, the path is /shop/[category]
  const basePath = category ? `/shop/${category}` : `/shop`;
  const baseUrl = `${basePath}${baseSearchString ? `?${baseSearchString}&` : '?'}`;

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans overflow-hidden">
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
          <div className="w-full max-w-[1200px] mx-auto mb-16 mt-4">
            <div className="grid grid-cols-2 border-y border-[#e8e0d9] lg:grid-cols-5">
              
              {/* FOOD */}
              <Link href="/shop/food" className="group flex min-h-40 flex-col items-center justify-center px-3 py-6 text-center transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5e3c] focus-visible:ring-inset sm:min-h-44 sm:px-6 border-r border-[#e8e0d9] border-b lg:border-b-0">
                <span className="relative mb-3 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center transition-transform duration-300 group-hover:-translate-y-1 text-[#c77e35]">
                  <div className="w-full h-full bg-[#c77e35]" style={{ WebkitMaskImage: 'url(/categories/Food_Stephans.png)', maskImage: 'url(/categories/Food_Stephans.png)', WebkitMaskPosition: 'center', maskPosition: 'center', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskSize: 'contain', maskSize: 'contain' }} />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#28231f] sm:text-xs">FOOD</span>
                <span className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#5d554f] sm:text-sm">Shop now <span aria-hidden="true" className="text-base leading-none transition-transform duration-300 group-hover:translate-x-1">→</span></span>
              </Link>

              {/* TREATS */}
              <Link href="/shop/treats" className="group flex min-h-40 flex-col items-center justify-center px-3 py-6 text-center transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5e3c] focus-visible:ring-inset sm:min-h-44 sm:px-6 border-b lg:border-b-0 lg:border-r lg:border-[#e8e0d9]">
                <span className="relative mb-3 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center transition-transform duration-300 group-hover:-translate-y-1 text-[#c77e35]">
                  <div className="w-full h-full bg-[#c77e35]" style={{ WebkitMaskImage: 'url(/categories/Treats_Stephans.png)', maskImage: 'url(/categories/Treats_Stephans.png)', WebkitMaskPosition: 'center', maskPosition: 'center', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskSize: 'contain', maskSize: 'contain' }} />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#28231f] sm:text-xs">TREATS</span>
                <span className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#5d554f] sm:text-sm">Shop now <span aria-hidden="true" className="text-base leading-none transition-transform duration-300 group-hover:translate-x-1">→</span></span>
              </Link>

              {/* TOYS */}
              <Link href="/shop/toys" className="group flex min-h-40 flex-col items-center justify-center px-3 py-6 text-center transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5e3c] focus-visible:ring-inset sm:min-h-44 sm:px-6 border-r border-[#e8e0d9] border-b lg:border-b-0">
                <span className="relative mb-3 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center transition-transform duration-300 group-hover:-translate-y-1 text-[#c77e35]">
                  <div className="w-full h-full bg-[#c77e35]" style={{ WebkitMaskImage: 'url(/categories/Toys_Stephans.png)', maskImage: 'url(/categories/Toys_Stephans.png)', WebkitMaskPosition: 'center', maskPosition: 'center', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskSize: 'contain', maskSize: 'contain' }} />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#28231f] sm:text-xs">TOYS</span>
                <span className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#5d554f] sm:text-sm">Shop now <span aria-hidden="true" className="text-base leading-none transition-transform duration-300 group-hover:translate-x-1">→</span></span>
              </Link>

              {/* ACCESSORIES */}
              <Link href="/shop/accessories" className="group flex min-h-40 flex-col items-center justify-center px-3 py-6 text-center transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5e3c] focus-visible:ring-inset sm:min-h-44 sm:px-6 border-b lg:border-b-0 lg:border-r lg:border-[#e8e0d9]">
                <span className="relative mb-3 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center transition-transform duration-300 group-hover:-translate-y-1 text-[#c77e35]">
                  <div className="w-full h-full bg-[#c77e35]" style={{ WebkitMaskImage: 'url(/categories/Accessories_Stephans.png)', maskImage: 'url(/categories/Accessories_Stephans.png)', WebkitMaskPosition: 'center', maskPosition: 'center', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskSize: 'contain', maskSize: 'contain' }} />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#28231f] sm:text-xs">ACCESSORIES</span>
                <span className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#5d554f] sm:text-sm">Shop now <span aria-hidden="true" className="text-base leading-none transition-transform duration-300 group-hover:translate-x-1">→</span></span>
              </Link>

              {/* GROOMING */}
              <Link href="/grooming" className="group flex min-h-40 flex-col items-center justify-center px-3 py-6 text-center transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5e3c] focus-visible:ring-inset sm:min-h-44 sm:px-6 col-span-2 lg:col-span-1">
                <span className="relative mb-3 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center transition-transform duration-300 group-hover:-translate-y-1 text-[#c77e35]">
                  <div className="w-full h-full bg-[#c77e35]" style={{ WebkitMaskImage: 'url(/categories/Grooming_Scissors.png)', maskImage: 'url(/categories/Grooming_Scissors.png)', WebkitMaskPosition: 'center', maskPosition: 'center', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskSize: 'contain', maskSize: 'contain' }} />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#28231f] sm:text-xs">GROOMING</span>
                <span className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#5d554f] sm:text-sm">Book now <span aria-hidden="true" className="text-base leading-none transition-transform duration-300 group-hover:translate-x-1">→</span></span>
              </Link>

            </div>
          </div>
        </>
      )}

      <div className="w-full bg-white pt-8 pb-24 border-t border-[#EAE3D9]">
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
    </div>
  );
}
