import React, { cache } from "react";
import { CategoryNavigationSection } from "@/components/app/CategoryNavigationSection";
import { sanityFetch } from "@/sanity/lib/live";
import {
  ALL_CATEGORIES_QUERY
} from "@/lib/sanity/queries/categories";
import {
  ALL_BRANDS_QUERY
} from "@/lib/sanity/queries/brands";
import {
  PRODUCT_BY_SLUG_QUERY,
  PRODUCTS_BY_CATEGORY_QUERY,
  PAGINATED_PRODUCTS_BY_NAME_QUERY,
  PAGINATED_PRODUCTS_BY_PRICE_ASC_QUERY,
  PAGINATED_PRODUCTS_BY_PRICE_DESC_QUERY,
  PAGINATED_PRODUCTS_BY_RELEVANCE_QUERY,
  FILTERED_PRODUCTS_COUNT_QUERY,
} from "@/lib/sanity/queries/products";
import { ProductGallery } from "@/components/app/ProductGallery";
import { ProductInfo } from "@/components/app/ProductInfo";
import { ProductTabs } from "@/components/app/ProductTabs";
import { ProductCard } from "@/components/app/ProductCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, buildProductDescription } from "@/lib/seo";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/structured-data";
import { cleanCatalogProducts } from "@/lib/catalog/clean-products";
import { ProductGrid } from "@/components/app/ProductGrid";
import { ShopFilterSidebar } from "@/components/app/ShopFilterSidebar";
import { ShopToolbar } from "@/components/app/ShopToolbar";
import { ChevronRight } from "lucide-react";
import { FoodBowlIcon, BoneIcon, TeddyBearIcon, CollarIcon, ScissorsBubblesIcon } from "@/components/app/CustomIcons";
import { Metadata } from "next";
import Link from "next/link";
import { getCachedOdooCatalog, getCachedOdooCategories } from "@/lib/catalog/server-catalog";

export const revalidate = 300;

// Metadata and the product page request the same record. React cache keeps
// that lookup to one Sanity round trip for a render.
const getSanityProduct = cache(async (slug: string) => {
  const { data } = await sanityFetch({
    query: PRODUCT_BY_SLUG_QUERY,
    params: { slug },
  });
  return data;
});

async function withTimeout<T>(promise: Promise<T>, fallback: T, milliseconds = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), milliseconds)),
  ]);
}

export async function generateMetadata(props: ProductsPageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const pathParams = await props.params;
  
  // Use path parameter if it exists, otherwise use search param
  const categoryParam = (pathParams?.categorySlug?.[0]) || searchParams?.category;
  
  if (categoryParam) {
    if (pathParams?.categorySlug?.length === 1) {
      try {
        const product = await getSanityProduct(categoryParam);

        if (product) {
          const path = `/shop/${product.slug || categoryParam}`;
          const productName = product.name || "Pet Product";
          const description = buildProductDescription(product);
          const imageUrl = product.images?.[0]?.asset?.url;

          return {
            title: `${productName} | Stephan's Pet Store - Dar es Salaam`,
            description,
            alternates: {
              canonical: path,
            },
            openGraph: {
              type: "website",
              url: absoluteUrl(path),
              title: `${productName} | Stephan's Pet Store`,
              description,
              images: imageUrl ? [{ url: imageUrl, alt: productName }] : undefined,
            },
            twitter: {
              card: "summary_large_image",
              title: `${productName} | Stephan's Pet Store`,
              description,
              images: imageUrl ? [imageUrl] : undefined,
            },
          };
        }
      } catch (e) {
        // Fallback to category metadata
      }
    }
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
    page?: string;
  }>;
}

export default async function ProductsPage(props: ProductsPageProps) {
  const searchParams = await props.searchParams;
  const pathParams = await props.params;

  // Single Product Route: /shop/[product-slug]
  if (pathParams?.categorySlug?.length === 1 && !searchParams?.category) {
    const candidateSlug = pathParams.categorySlug[0];
    try {
      let product: any = null;
      try {
        product = await getSanityProduct(candidateSlug);
      } catch (e) {
        // Continue to fallback
      }

      // Fallback: check Odoo catalog if not found in Sanity
      if (!product) {
        try {
          const { products: odooProducts } = await getCachedOdooCatalog();
          const match = odooProducts.find(
            (p: any) =>
              p.slug === candidateSlug ||
              p._id === candidateSlug ||
              p.slug === `odoo-${candidateSlug}` ||
              p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === candidateSlug
          );
          if (match) {
            product = match;
          }
        } catch (e) {
          // Continue
        }
      }

      if (product) {
        const category = product.categories?.[0];
        let relatedProducts: any[] = [];
        if (category?.slug) {
          try {
            const { data: relatedProductsRaw } = await sanityFetch({
              query: PRODUCTS_BY_CATEGORY_QUERY,
              params: { categorySlug: category.slug },
            });
            relatedProducts = (relatedProductsRaw || [])
              .filter((p: any) => p._id !== product._id)
              .slice(0, 4);
          } catch (e) {
            // ignore related error
          }
        }

        const breadcrumbs = [
          { name: "Home", url: "/" },
          { name: "Shop", url: "/shop" },
          ...(category ? [{ name: category.title, url: `/shop/${category.slug}` }] : []),
          { name: product.name, url: `/shop/${product.slug || candidateSlug}` },
        ];

        return (
          <div className="min-h-screen bg-white dark:bg-zinc-950 pt-4 sm:pt-8">
            <JsonLd data={[productJsonLd(product), breadcrumbJsonLd(breadcrumbs)]} />
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
                  Home
                </Link>
                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                <Link href="/shop" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
                  Shop
                </Link>
                {category && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                    <Link
                      href={`/shop/${category.slug}`}
                      className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors capitalize"
                    >
                      {category.title}
                    </Link>
                  </>
                )}
                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-medium text-zinc-900 dark:text-zinc-50 truncate">
                  {product.name}
                </span>
              </div>

              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10 relative items-start">
                {/* Left Column: Image Gallery & Tabs */}
                <div className="flex flex-col gap-8 min-w-0">
                  <ProductGallery images={product.images} productName={product.name} />
                  <ProductTabs product={product} relatedProducts={relatedProducts} />
                </div>

                {/* Right Column: Sticky Product Info */}
                <div className="lg:sticky lg:top-[150px] h-fit">
                  <ProductInfo product={product} />
                </div>
              </div>
            </div>
          </div>
        );
      }
    } catch (e) {
      // Fall through to category list
    }
  }

  const { q, brand, color, sort, minPrice, maxPrice, page } = searchParams;
  const category = (pathParams?.categorySlug?.[0]) || searchParams.category;
  
  const currentPage = parseInt(page || "1", 10);
  const itemsPerPage = 8;
  const requestedPage = Number.isFinite(currentPage) ? Math.max(1, currentPage) : 1;

  // Prepare Query Parameters
  const queryParams: any = {
    searchQuery: q || "",
    categorySlug: category || "",
    categoryLeafSlug: "",
    brandSlug: brand || "",
    minPrice: minPrice ? Number(minPrice) : 0,
    maxPrice: maxPrice ? Number(maxPrice) : 0,
    inStock: false,
    color: color || "",
    material: "", // Default
    start: (requestedPage - 1) * itemsPerPage,
    end: requestedPage * itemsPerPage,
  };

  // Determine which query to use based on sort
  let query: any = PAGINATED_PRODUCTS_BY_NAME_QUERY;
  if (q) query = PAGINATED_PRODUCTS_BY_RELEVANCE_QUERY;
  if (sort === "price-asc") query = PAGINATED_PRODUCTS_BY_PRICE_ASC_QUERY;
  else if (sort === "price-desc") query = PAGINATED_PRODUCTS_BY_PRICE_DESC_QUERY;
  else if (sort === "relevance") query = PAGINATED_PRODUCTS_BY_RELEVANCE_QUERY;
  else if (sort === "name") query = PAGINATED_PRODUCTS_BY_NAME_QUERY;

  // Fetch Data in Parallel (Sanity + Odoo Categories)
  const [sanityCategoriesResult, brandsResult, odooCategories] = await Promise.all([
    sanityFetch({ query: ALL_CATEGORIES_QUERY }),
    sanityFetch({ query: ALL_BRANDS_QUERY }),
    // Odoo enriches the sidebar, but it must never hold up the product grid
    // during a cold ERP connection. Sanity categories remain the immediate fallback.
    withTimeout(
      getCachedOdooCategories().catch(e => { console.error("Odoo categories fetch failed:", e); return []; }),
      []
    )
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
  
  // Fetch only the requested eight records and a lightweight count in parallel.
  const [productsResult, countResult] = await Promise.all([
    sanityFetch({ query, params: queryParams }),
    sanityFetch({ query: FILTERED_PRODUCTS_COUNT_QUERY, params: queryParams }),
  ]);
  const sanityProducts = productsResult.data || [];
  let totalProductCount = Number(countResult.data || 0);

  // Fetch Odoo Products (Fallback only if Sanity returns no products, avoiding heavy network delay)
  let odooProducts: any[] = [];
  if (sanityProducts.length === 0 && totalProductCount === 0) {
    try {
      const { products: odooProductsUnfiltered } = await getCachedOdooCatalog();
      odooProducts = odooProductsUnfiltered.filter((p: any) => {
        if (q && !p.name?.toLowerCase().includes(q.toLowerCase())) return false;
        if (category) { const t = category.endsWith('s') ? category.slice(0,-1) : category; if (!p.categories.some((c: any) => c.slug === category || c.slug.includes(t) || c.title?.toLowerCase().includes(t)) && !p.name?.toLowerCase().includes(t)) return false; }
        if (minPrice && p.price < Number(minPrice)) return false;
        if (maxPrice && p.price > Number(maxPrice)) return false;
        return true;
      });
      totalProductCount = odooProducts.length;
    } catch (error) {
      console.error("Failed to fetch Odoo fallback products:", error);
    }
  }
  
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

  // Odoo fallback results still need local ordering. Sanity results are already
  // ordered and sliced at the data source.
  if (sort === "price-asc") {
    combinedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sort === "price-desc") {
    combinedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sort === "name") {
    combinedProducts.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  } else if (odooProducts.length > 0 && (!sort || sort === "featured" || sort === "relevance")) {
    // Deterministic mix based on name string sum to shuffle products while keeping pagination stable
    combinedProducts.sort((a, b) => {
      const hashA = (a.name || a._id || "").split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      const hashB = (b.name || b._id || "").split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      const diff = (hashA % 13) - (hashB % 13);
      return diff !== 0 ? diff : hashA - hashB;
    });
  }

  const totalPages = Math.ceil(totalProductCount / itemsPerPage) || 1;
  
  // Ensure currentPage is within bounds
  const validCurrentPage = Math.max(1, Math.min(requestedPage, totalPages));
  
  const pagedProducts = odooProducts.length > 0
    ? combinedProducts.slice(
        (validCurrentPage - 1) * itemsPerPage,
        validCurrentPage * itemsPerPage,
      )
    : combinedProducts;

  // Construct baseUrl for pagination
  const urlSearchParams = new URLSearchParams();
  if (q) urlSearchParams.set("q", q);
  if (brand) urlSearchParams.set("brand", brand);
  if (sort) urlSearchParams.set("sort", sort);
  if (minPrice) urlSearchParams.set("minPrice", minPrice);
  if (maxPrice) urlSearchParams.set("maxPrice", maxPrice);
  
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
          <CategoryNavigationSection />
        </>
      )}

      <div className="w-full bg-[#FAF7F2] dark:bg-zinc-950 pt-8 pb-24 border-t border-[#EAE3D9] dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start">
            {/* Left Sidebar: Categories Filter */}
            <div className="hidden lg:block sticky top-24">
              <ShopFilterSidebar 
                categories={allCategories} 
                activeCategorySlug={category || ""} 
              />
            </div>

            {/* Right Main Content: Toolbar & Grid */}
            <div className="min-w-0 flex flex-col">
              <ShopToolbar 
                totalCount={totalProductCount} 
                currentSort={sort || "relevance"}
                itemsPerPage={itemsPerPage}
              />

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
      </div>
    </div>
  );
}
