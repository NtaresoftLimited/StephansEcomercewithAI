"use client";

import { useState, useRef, useEffect, MouseEvent, useCallback } from "react";
import Image from "next/image";
import { Maximize2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { sanityImageUrl } from "@/lib/sanity-image";

interface ProductGalleryProps {
  images: any[] | null;
  productName: string | null;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Magnifier state
  const [isZoomed, setIsZoomed] = useState(false);
  const [backgroundPosition, setBackgroundPosition] = useState("0% 0%");
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const thumbContainerRef = useRef<HTMLDivElement>(null);

  const normalizedImages = (images || []).map((img, idx) => {
    const url = img?.asset?.url || (typeof img === "string" ? img : img?.url) || "";
    return {
      id: img?._key || idx,
      url,
    };
  }).filter(img => Boolean(img.url));

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

  const scrollThumbnails = (direction: "up" | "down" | "left" | "right") => {
    if (!thumbContainerRef.current) return;
    const scrollAmount = 100;
    if (direction === "up") {
      thumbContainerRef.current.scrollBy({ top: -scrollAmount, behavior: "smooth" });
    } else if (direction === "down") {
      thumbContainerRef.current.scrollBy({ top: scrollAmount, behavior: "smooth" });
    } else if (direction === "left") {
      thumbContainerRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else if (direction === "right") {
      thumbContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Keyboard navigation for Lightbox
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) return;
    if (e.key === "Escape") setLightboxOpen(false);
    if (e.key === "ArrowLeft") {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : normalizedImages.length - 1));
    }
    if (e.key === "ArrowRight") {
      setSelectedIndex(prev => (prev < normalizedImages.length - 1 ? prev + 1 : 0));
    }
  }, [lightboxOpen, normalizedImages.length]);

  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, handleKeyDown]);

  if (normalizedImages.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-zinc-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-none">
        <span className="text-zinc-400 text-sm">No images available</span>
      </div>
    );
  }

  const selectedImage = normalizedImages[selectedIndex] || normalizedImages[0];
  const fullImageUrl = selectedImage?.url ? (sanityImageUrl(selectedImage.url, 1200) ?? selectedImage.url) : "";

  return (
    <>
      <div className="flex flex-col-reverse gap-4 lg:flex-row lg:items-start w-full">
        {/* Left Thumbnails Slider (Inspired by Dukanikwetu Image Gallery) */}
        {normalizedImages.length > 1 && (
          <div className="relative flex flex-col items-center flex-shrink-0 lg:w-20 xl:w-22">
            {/* Scroll Up Button (Desktop) */}
            {normalizedImages.length > 4 && (
              <button
                type="button"
                onClick={() => scrollThumbnails("up")}
                aria-label="Scroll thumbnails up"
                className="hidden lg:flex w-full items-center justify-center py-1 mb-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
            )}

            {/* Thumbnail List */}
            <div
              ref={thumbContainerRef}
              className="flex gap-2.5 overflow-x-auto w-full pb-2 lg:flex-col lg:overflow-y-auto lg:max-h-[500px] lg:pb-0 scrollbar-hide scroll-smooth"
            >
              {normalizedImages.map((image, index) => {
                const isSelected = selectedIndex === index;
                const thumbUrl = sanityImageUrl(image.url, 180) ?? image.url;

                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    aria-label={`View image ${index + 1}`}
                    className={cn(
                      "relative aspect-square w-18 lg:w-full flex-shrink-0 overflow-hidden rounded-xl border bg-white dark:bg-zinc-900 transition-all duration-200 shadow-none cursor-pointer",
                      isSelected
                        ? "border-[#8B1D42] ring-2 ring-[#8B1D42]/30 opacity-100"
                        : "border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-300 dark:hover:border-zinc-700"
                    )}
                  >
                    <Image
                      src={thumbUrl}
                      alt={`${productName} thumbnail ${index + 1}`}
                      fill
                      className="object-contain p-2 transition-transform duration-200 hover:scale-105"
                      sizes="90px"
                    />
                  </button>
                );
              })}
            </div>

            {/* Scroll Down Button (Desktop) */}
            {normalizedImages.length > 4 && (
              <button
                type="button"
                onClick={() => scrollThumbnails("down")}
                aria-label="Scroll thumbnails down"
                className="hidden lg:flex w-full items-center justify-center py-1 mt-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Main Image Container */}
        <div className="flex-1 w-full min-w-0">
          <div
            ref={imgContainerRef}
            className="relative aspect-square w-full overflow-hidden rounded-2xl border border-zinc-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-950 cursor-crosshair group shadow-none transition-colors"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {fullImageUrl ? (
              <>
                <Image
                  src={fullImageUrl}
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

                {/* Dukanikwetu-style Expandable "Click to Enlarge" Pill */}
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Click to Enlarge"
                  className="absolute bottom-4 left-4 h-10 w-10 hover:w-38 rounded-full border border-zinc-200/90 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 text-zinc-700 dark:text-zinc-200 flex items-center justify-start px-2.5 overflow-hidden transition-all duration-300 shadow-none group/enlarge cursor-pointer z-10"
                >
                  <Maximize2 className="w-5 h-5 flex-shrink-0 text-zinc-700 dark:text-zinc-200" />
                  <span className="ml-2 text-xs font-semibold whitespace-nowrap opacity-0 group-hover/enlarge:opacity-100 transition-opacity duration-200">
                    Click to Enlarge
                  </span>
                </button>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400">
                No image available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Fullscreen Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Close button */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close enlarged view"
            className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-20 shadow-none border-0"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Image */}
          {normalizedImages.length > 1 && (
            <button
              type="button"
              onClick={() => setSelectedIndex(prev => (prev > 0 ? prev - 1 : normalizedImages.length - 1))}
              aria-label="Previous image"
              className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-20 shadow-none border-0"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          )}

          {/* Main Enlarged Image */}
          <div className="relative w-full max-w-4xl h-[80vh] flex items-center justify-center">
            {fullImageUrl && (
              <Image
                src={fullImageUrl}
                alt={productName ?? "Enlarged product image"}
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 90vw, 1200px"
              />
            )}
          </div>

          {/* Next Image */}
          {normalizedImages.length > 1 && (
            <button
              type="button"
              onClick={() => setSelectedIndex(prev => (prev < normalizedImages.length - 1 ? prev + 1 : 0))}
              aria-label="Next image"
              className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-20 shadow-none border-0"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          )}

          {/* Bottom Counter */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/80 text-xs font-medium bg-black/40 px-3.5 py-1.5 rounded-full border border-white/10">
            {selectedIndex + 1} / {normalizedImages.length}
          </div>
        </div>
      )}
    </>
  );
}
