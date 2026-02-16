import { notFound } from "next/navigation";
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image Gallery */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* Product Info */}
          <ProductInfo product={product} />
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
