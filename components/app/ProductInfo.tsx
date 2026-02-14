import Link from "next/link";
import { AddToCartButton } from "@/components/app/AddToCartButton";
import { AskAISimilarButton } from "@/components/app/AskAISimilarButton";
import { StockBadge } from "@/components/app/StockBadge";
import { formatPrice } from "@/lib/utils";
// import type { PRODUCT_BY_SLUG_QUERYResult } from "@/sanity.types";

interface ProductInfoProps {
  product: any; // NonNullable<PRODUCT_BY_SLUG_QUERYResult>;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const imageUrl = product.images?.[0]?.asset?.url;

  return (
    <div className="flex flex-col">
      {/* Category */}
      {product.category && (
        <Link
          href={`/?category=${product.category.slug}`}
          className="text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          {product.category.title}
        </Link>
      )}

      {/* Title */}
      <h1 className="mt-4 text-4xl font-medium tracking-tight text-foreground">
        {product.name}
      </h1>

      {/* Price */}
      <p className="mt-6 text-3xl font-light text-foreground">
        {formatPrice(product.price)}
      </p>

      {/* Description */}
      {product.description && (
        <p className="mt-8 text-base leading-relaxed text-muted-foreground/80 max-w-xl">
          {product.description}
        </p>
      )}

      {/* Stock & Add to Cart */}
      <div className="mt-10 flex flex-col gap-5">
        <StockBadge productId={product._id} stock={product.stock ?? 0} />
        
        <div className="flex flex-col sm:flex-row gap-4">
          <AddToCartButton
            productId={product._id}
            name={product.name ?? "Unknown Product"}
            price={product.price ?? 0}
            image={imageUrl ?? undefined}
            stock={product.stock ?? 0}
            className="h-12 px-8 text-sm font-medium tracking-widest uppercase bg-foreground text-background hover:bg-foreground/90 rounded-full"
          />
          <AskAISimilarButton 
            productName={product.name ?? "this product"} 
          />
        </div>
      </div>

      {/* Metadata - Minimalist Table */}
      <div className="mt-12 pt-8 border-t border-border">
        <h3 className="text-sm font-medium uppercase tracking-widest text-foreground mb-6">Specifications</h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          {product.material && (
            <div className="border-b border-border pb-2">
              <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Material</dt>
              <dd className="text-sm font-medium text-foreground capitalize">{product.material}</dd>
            </div>
          )}
          {product.color && (
            <div className="border-b border-border pb-2">
              <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Color</dt>
              <dd className="text-sm font-medium text-foreground capitalize">{product.color}</dd>
            </div>
          )}
          {product.dimensions && (
            <div className="border-b border-border pb-2">
              <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Dimensions</dt>
              <dd className="text-sm font-medium text-foreground">{product.dimensions}</dd>
            </div>
          )}
          {product.assemblyRequired !== null && (
            <div className="border-b border-border pb-2">
              <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Assembly</dt>
              <dd className="text-sm font-medium text-foreground">
                {product.assemblyRequired ? "Required" : "Not required"}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
