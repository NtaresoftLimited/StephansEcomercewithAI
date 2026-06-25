import { sanityFetch } from "@/sanity/lib/live";
import { ALL_BRANDS_QUERY } from "@/lib/sanity/queries/brands";
import { PRODUCTS_WITH_BRANDS_QUERY } from "@/lib/sanity/queries/products";
import { ProductCard } from "@/components/app/ProductCard";
import { BrandHero } from "@/components/app/BrandHero";
import { BrandRotatingProducts } from "@/components/app/BrandRotatingProducts";
import { odoo } from "@/lib/odoo/client";
import { Metadata } from "next";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Our Brands | Stephan's Pet Store",
  description: "Explore premium pet care brands available at Stephan's Pet Store",
};

export default async function BrandsPage() {
  // Fetch brands from Odoo and Sanity, prefer Sanity logo for high quality
  const [sanityBrands, odooBrands, productsResult] = await Promise.all([
    sanityFetch({ query: ALL_BRANDS_QUERY })
      .then((r: any) => r?.data as any[])
      .catch(() => [] as any[]),
    odoo.getBrands().catch(() => [] as any[]),
    sanityFetch({ query: PRODUCTS_WITH_BRANDS_QUERY })
      .then((r: any) => r?.data as any[])
      .catch(() => [] as any[]),
  ]);

  const products = productsResult || [];
  const mergedByName = new Map<string, any>();
  
  for (const b of (odooBrands as any[]) || []) {
    const bNameStr = typeof b.name === 'string' ? b.name.toLowerCase() : String(b.name || "").toLowerCase();
    const match =
      (sanityBrands as any[])?.find(
        (s) => {
           const sNameStr = typeof s.name === 'string' ? s.name.toLowerCase() : String(s.name || "").toLowerCase();
           return sNameStr === bNameStr;
        }
      ) || null;

    // Prefer Sanity logo if available
    let logo = match?.logo;
    if (!logo && b.logo) {
      // Fallback to Odoo logo
      logo = `data:image/png;base64,${b.logo}`;
    }

    mergedByName.set(bNameStr, {
      _id: match?._id || b.id?.toString() || bNameStr.replace(/\s+/g, "-"),
      id: b.id,
      name: b.name,
      slug: match?.slug || bNameStr.replace(/\s+/g, "-"),
      logo,
      description: match?.description,
    });
  }

  for (const s of ((sanityBrands as any[]) || [])) {
    const key = typeof s.name === 'string' ? s.name.toLowerCase() : String(s.name || "").toLowerCase();
    if (!mergedByName.has(key)) {
      mergedByName.set(key, {
        _id: s._id,
        name: s.name,
        slug: s.slug,
        logo: s.logo,
        description: s.description,
      });
    }
  }

  const brandsWithProducts = Array.from(mergedByName.values()).map(brand => {
    // Find all products for this brand
    const brandProducts = products
      .filter(p => p.brand?.name?.toLowerCase() === brand.name.toLowerCase())
      .sort((a, b) => (b.stock || 0) - (a.stock || 0)); // Show in-stock first

    return {
      ...brand,
      products: brandProducts
    };
  }).filter(brand => brand.products.length > 0); // Only show brands with products

  return (
    <div className="min-h-screen bg-white">
      <BrandHero />
      
      <BrandRotatingProducts products={products} />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="space-y-32">
          {brandsWithProducts.map((brand) => (
            <section key={brand.slug} className="relative">
              <div className="flex flex-col space-y-8">
                {/* Brand Header */}
                <div className="flex items-end justify-between border-b border-zinc-100 pb-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      Brand
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
                      {brand.name}
                    </h2>
                    <div className="w-12 h-1 bg-[#6b3e1e] rounded-full" />
                  </div>
                  
                  {brand.logo && (
                    <div className="h-12 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                      <img 
                        src={brand.logo} 
                        alt={brand.name} 
                        className="h-full w-auto object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-12">
                  {brand.products.slice(0, 12).map((product: any) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
