"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
// import type { PRODUCT_BY_SLUG_QUERYResult } from "@/sanity.types";

// type ProductImages = NonNullable<
//   NonNullable<PRODUCT_BY_SLUG_QUERYResult>["images"]
// >;

interface ProductGalleryProps {
  images: any[] | null; // ProductImages | null;
  productName: string | null;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
        <span className="text-zinc-400">No images available</span>
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      {/* Thumbnail Strip (Desktop: Left, Mobile: Bottom/Scroll) */}
      {images.length > 1 && (
        <div className="order-2 flex gap-3 overflow-x-auto pb-2 md:order-1 md:h-[500px] md:w-24 md:flex-col md:overflow-y-auto md:pb-0 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
          {images.map((image, index) => (
            <button
              key={image._key}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`View image ${index + 1}`}
              aria-pressed={selectedIndex === index}
              className={cn(
                "relative aspect-square h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-zinc-100 transition-all dark:bg-zinc-800 md:h-24 md:w-24",
                selectedIndex === index
                  ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              {image.asset?.url ? (
                <Image
                  src={image.asset.url}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="100px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                  N/A
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="order-1 relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 md:order-2 md:aspect-auto md:h-[500px] md:flex-1">
        {selectedImage?.asset?.url ? (
          <Image
            src={selectedImage.asset.url}
            alt={productName ?? "Product image"}
            fill
            unoptimized
            className="object-contain p-2"
            sizes="(max-width: 768px) 100vw, 80vw"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-400">
            No image
          </div>
        )}
      </div>
    </div>
  );
}
