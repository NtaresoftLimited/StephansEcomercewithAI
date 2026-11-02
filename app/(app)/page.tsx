import { Suspense } from "react";
import Link from "next/link";
import { sanityFetch } from "@/sanity/lib/live";
import { getCachedOdooCatalog } from "@/lib/catalog/server-catalog";
import { NEW_ARRIVALS_QUERY } from "@/lib/sanity/queries/products";
import { cleanCatalogProducts } from "@/lib/catalog/clean-products";
import { HeroSection } from "@/components/app/HeroSection";
import { PetCategoryStrip } from "@/components/app/PetCategoryStrip";
import { GroomingSection } from "@/components/app/GroomingSection";
import { AutoRotatingProductGrid } from "@/components/app/AutoRotatingProductGrid";
import { ReviewsSection } from "@/components/app/ReviewsSection";
import { CategoryNavigationSection } from "@/components/app/CategoryNavigationSection";
import { NewsletterSection } from "@/components/app/grooming/NewsletterSection";

export const revalidate = 300;

export default async function HomePage() {
  // Sanity and the cached Odoo fallback are independent. Start both together
  // so Odoo authentication/RPC never creates a serial request waterfall.
  const [sanityProducts, odooCatalog] = await Promise.all([
    sanityFetch({
      query: NEW_ARRIVALS_QUERY,
      params: {
        searchQuery: "",
        categorySlug: "",
        categoryLeafSlug: "",
        brandSlug: "",
        color: "",
        material: "",
        minPrice: 0,
        maxPrice: 0,
        inStock: false,
      },
    }).then((r: any) => (r?.data || []) as any[]).catch((e: any) => {
      console.error("Sanity fetch failed in HomePage:", e);
      return [] as any[];
    }),
    getCachedOdooCatalog().catch((error) => {
      console.error("Cached Odoo catalog fetch failed:", error);
      return { categories: [], products: [] };
    }),
  ]);

  const odooProducts = odooCatalog.products;

  // Sort Odoo products by sales_count (Top Products) and take top 50 to mix
  const topOdooProducts = [...odooProducts].sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0)).slice(0, 50);
  
  let products = cleanCatalogProducts([...sanityProducts, ...topOdooProducts]);

  // Interleave curated products: 1 Dog, 2 Cat, 3 Small Animal, 4 Bird/Grooming
  if (products.length > 0) {
    const dogs: any[] = [];
    const cats: any[] = [];
    const smalls: any[] = [];
    const birdsGrooming: any[] = [];
    const others: any[] = [];

    // Stable mix keeps the rendered output cacheable while retaining variety.
    const stableProductHash = (product: any) => String(product._id || product.name || "")
      .split("")
      .reduce((sum: number, char: string) => ((sum * 31) + char.charCodeAt(0)) >>> 0, 0);
    products = [...products].sort((a, b) => stableProductHash(a) - stableProductHash(b));

    for (const product of products) {
      const categoryNames = product.categories?.map((c: any) => (c.title || c.name || "").toLowerCase()) || [];
      const categorySlugs = product.categories?.map((c: any) => (c.slug?.current || c.slug || "").toLowerCase()) || [];
      const combined = [...categoryNames, ...categorySlugs].join(" ");
      const productName = (product.name || "").toLowerCase();
      const combinedText = combined + " " + productName;

      if (combinedText.includes("dog") || combinedText.includes("puppy")) {
        dogs.push(product);
      } else if (combinedText.includes("cat") || combinedText.includes("kitten")) {
        cats.push(product);
      } else if (combinedText.includes("small") || combinedText.includes("rabbit") || combinedText.includes("hamster") || combinedText.includes("guinea") || combinedText.includes("reptile")) {
        smalls.push(product);
      } else if (combinedText.includes("bird") || combinedText.includes("parrot") || combinedText.includes("grooming") || combinedText.includes("shampoo")) {
        birdsGrooming.push(product);
      } else {
        others.push(product);
      }
    }

    const uniqueProducts = new Set<string>();
    const uniqueNames = new Set<string>();
    const selected = [];

    const getUniqueProduct = (list: any[], fallbackList: any[]) => {
      const isUnique = (p: any) => {
        if (!p.name) return false;
        // get first two words as a fingerprint to avoid picking variants of the same product
        const nameFingerprint = p.name.toLowerCase().split(' ').slice(0, 2).join(' ');
        if (uniqueProducts.has(p._id) || uniqueNames.has(nameFingerprint)) {
          return false;
        }
        uniqueProducts.add(p._id);
        uniqueNames.add(nameFingerprint);
        return true;
      };

      for (const p of list) {
        if (isUnique(p)) return p;
      }
      for (const p of fallbackList) {
        if (isUnique(p)) return p;
      }
      for (const p of products) {
        if (isUnique(p)) return p;
      }
      return null;
    };

    const balancedProducts: any[] = [];
    const maxRounds = 5; // Up to 5 slides (20 products) rotating every 20s
    for (let r = 0; r < maxRounds; r++) {
      const p1 = getUniqueProduct(dogs, others);
      const p2 = getUniqueProduct(cats, others);
      const p3 = getUniqueProduct(smalls, others);
      const p4 = getUniqueProduct(birdsGrooming, others);

      const round = [p1, p2, p3, p4].filter(Boolean);
      if (round.length === 4) {
        balancedProducts.push(...round);
      } else {
        break;
      }
    }

    if (balancedProducts.length >= 8) {
      products = balancedProducts;
    } else {
      const p1 = getUniqueProduct(dogs, others);
      if (p1) selected.push(p1);
      const p2 = getUniqueProduct(cats, others);
      if (p2) selected.push(p2);
      const p3 = getUniqueProduct(smalls, others);
      if (p3) selected.push(p3);
      const p4 = getUniqueProduct(birdsGrooming, others);
      if (p4) selected.push(p4);
      products = selected.length > 0 ? selected : products;
    }
  }

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
      <section className="py-16 md:py-24 bg-white border-t border-border">
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
        <GroomingSection />
      </Suspense>

      <ReviewsSection />
      <NewsletterSection />
    </div>
  );
}
