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
      <div className="flex aspect-[4/5] items-center justify-center bg-zinc-50 dark:bg-zinc-800">
        <span className="text-zinc-400">No images available</span>
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 md:w-[80px] md:flex-col md:overflow-y-auto md:pb-0 scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={image._key}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`View image ${index + 1}`}
              className={cn(
                "relative aspect-[4/5] h-20 w-20 flex-shrink-0 overflow-hidden border transition-all dark:border-zinc-700",
                selectedIndex === index
                  ? "border-zinc-900 ring-1 ring-zinc-900 dark:border-zinc-100 dark:ring-zinc-100"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              {image.asset?.url ? (
                <Image
                  src={image.asset.url}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-zinc-400">
                  N/A
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-white dark:bg-zinc-800 md:flex-1">
        {selectedImage?.asset?.url ? (
          <Image
            src={selectedImage.asset.url}
            alt={productName ?? "Product image"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
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
