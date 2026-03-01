"use client";

import { useState, useRef, MouseEvent } from "react";
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

  // Magnifier state
  const [isZoomed, setIsZoomed] = useState(false);
  const [backgroundPosition, setBackgroundPosition] = useState("0% 0%");
  const imgContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imgContainerRef.current) return;
    const { left, top, width, height } = imgContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  };

  const handleMouseEnter = () => setIsZoomed(true);
  const handleMouseLeave = () => {
    setIsZoomed(false);
    setBackgroundPosition("0% 0%");
  };

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800">
        <span className="text-zinc-400">No images available</span>
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row-reverse lg:items-start">
      {/* Main Image Container */}
      <div className="flex-1 w-full max-w-2xl mx-auto">
        <div
          ref={imgContainerRef}
          className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 cursor-crosshair group shadow-sm transition-all duration-300 hover:shadow-md"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {selectedImage?.asset?.url ? (
            <>
              <Image
                src={selectedImage.asset.url}
                alt={productName ?? "Product image"}
                fill
                className={cn(
                  "object-contain p-6 transition-transform duration-300 ease-out translate-z-0",
                  isZoomed ? "scale-150" : "scale-100"
                )}
                style={{
                  transformOrigin: isZoomed ? backgroundPosition : "center center",
                }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {/* Zoom Indicator */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md rounded-full p-3 shadow-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400">
              No image
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-4 lg:w-[100px] lg:flex-col lg:overflow-y-auto lg:pb-0 scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={image._key}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`View image ${index + 1}`}
              className={cn(
                "relative aspect-square w-20 lg:w-full flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 bg-zinc-50 dark:bg-zinc-900 group",
                selectedIndex === index
                  ? "border-zinc-900 scale-95 dark:border-zinc-100"
                  : "border-zinc-100 dark:border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-300 dark:hover:border-zinc-600"
              )}
            >
              {image.asset?.url ? (
                <Image
                  src={image.asset.url}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  className="object-contain p-2 transition-transform duration-300 group-hover:scale-110"
                  sizes="100px"
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
    </div>
  );
}
