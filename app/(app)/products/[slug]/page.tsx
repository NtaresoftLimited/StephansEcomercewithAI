import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { sanityFetch } from "@/sanity/lib/live";
import { PRODUCT_BY_SLUG_QUERY, PRODUCTS_BY_CATEGORY_QUERY } from "@/lib/sanity/queries/products";
import { ProductGallery } from "@/components/app/ProductGallery";
import { ProductInfo } from "@/components/app/ProductInfo";
import { ProductCard } from "@/components/app/ProductCard";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const { data: product } = await sanityFetch({
    query: PRODUCT_BY_SLUG_QUERY,
    params: { slug },
  });

  if (!product) {
    notFound();
  }

  // Fetch related products
  const { data: relatedProductsRaw } = await sanityFetch({
    query: PRODUCTS_BY_CATEGORY_QUERY,
    params: { categorySlug: product.category?.slug || "" },
  });

  const relatedProducts = (relatedProductsRaw || [])
    .filter((p: any) => p._id !== product._id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 pt-20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 scale-[0.9] origin-top">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <Link href="/products" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
            Shop
          </Link>
          {product.category && (
            <>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
              <Link
                href={`/products?category=${product.category.slug}`}
                className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors capitalize"
              >
                {product.category.title}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium text-zinc-900 dark:text-zinc-50 truncate">
            {product.name}
          </span>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image Gallery */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* Product Info */}
          <div className="lg:sticky lg:top-24 h-fit">
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 border-t border-zinc-200 dark:border-zinc-800 pt-16">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-8 uppercase text-center">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((related: any) => (
                <ProductCard key={related._id} product={related} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
