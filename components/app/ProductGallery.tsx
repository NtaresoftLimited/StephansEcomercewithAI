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
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const normalizedImages = (images || []).map((img, idx) => {
    const url = img?.asset?.url || (typeof img === "string" ? img : img?.url) || "";
    return {
      id: img?._key || idx,
      url,
    };
  }).filter(img => Boolean(img.url));

  const selectImage = useCallback((index: number) => {
    if (normalizedImages.length === 0) return;
    const nextIdx = (index + normalizedImages.length) % normalizedImages.length;
    setSelectedIndex(nextIdx);
    const btn = thumbRefs.current[nextIdx];
    if (btn && thumbContainerRef.current) {
      btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [normalizedImages.length]);

  const handlePrevImage = useCallback(() => {
    selectImage(selectedIndex - 1);
  }, [selectImage, selectedIndex]);

  const handleNextImage = useCallback(() => {
    selectImage(selectedIndex + 1);
  }, [selectImage, selectedIndex]);

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

  // Keyboard navigation for Lightbox
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) return;
    if (e.key === "Escape") setLightboxOpen(false);
    if (e.key === "ArrowLeft") handlePrevImage();
    if (e.key === "ArrowRight") handleNextImage();
  }, [lightboxOpen, handlePrevImage, handleNextImage]);

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
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-none">
        <span className="text-zinc-400 text-sm">No images available</span>
      </div>
    );
  }

  const selectedImage = normalizedImages[selectedIndex] || normalizedImages[0];
  const fullImageUrl = selectedImage?.url ? (sanityImageUrl(selectedImage.url, 1200) ?? selectedImage.url) : "";

  return (
    <>
      <div className="flex flex-col-reverse gap-3 lg:flex-row lg:items-start w-full">
        {/* Left Vertical Thumbnails Strip */}
        {normalizedImages.length > 1 && (
          <div className="relative flex flex-row lg:flex-col items-center flex-shrink-0 lg:w-16 gap-2">
            {/* Previous / Up Arrow */}
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label="Previous image"
              className="hidden lg:flex h-7 w-full items-center justify-center rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 dark:hover:text-zinc-100 transition-colors cursor-pointer shadow-none"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>

            {/* Thumbnail List */}
            <div
              ref={thumbContainerRef}
              className="flex gap-2 overflow-x-auto w-full pb-1 lg:flex-col lg:overflow-y-auto lg:max-h-[380px] lg:pb-0 scrollbar-hide scroll-smooth"
            >
              {normalizedImages.map((image, index) => {
                const isSelected = selectedIndex === index;
                const thumbUrl = sanityImageUrl(image.url, 180) ?? image.url;

                return (
                  <button
                    key={image.id}
                    ref={(el) => { thumbRefs.current[index] = el; }}
                    type="button"
                    onClick={() => selectImage(index)}
                    aria-label={`View image ${index + 1}`}
                    className={cn(
                      "relative aspect-square w-16 lg:w-full flex-shrink-0 overflow-hidden rounded-xl border bg-white dark:bg-zinc-950 transition-all duration-200 shadow-none cursor-pointer",
                      isSelected
                        ? "border-zinc-900 dark:border-zinc-100 opacity-100"
                        : "border-zinc-200/80 dark:border-zinc-800 opacity-65 hover:opacity-100 hover:border-zinc-300 dark:hover:border-zinc-700"
                    )}
                  >
                    <Image
                      src={thumbUrl}
                      alt={`${productName} thumbnail ${index + 1}`}
                      fill
                      className="object-contain p-2 transition-transform duration-200"
                      sizes="80px"
                    />
                  </button>
                );
              })}
            </div>

            {/* Next / Down Arrow */}
            <button
              type="button"
              onClick={handleNextImage}
              aria-label="Next image"
              className="hidden lg:flex h-7 w-full items-center justify-center rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 dark:hover:text-zinc-100 transition-colors cursor-pointer shadow-none"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Image Container */}
        <div className="flex-1 w-full min-w-0">
          <div
            ref={imgContainerRef}
            className="relative aspect-square w-full max-h-[460px] overflow-hidden rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950 cursor-crosshair group shadow-none transition-colors"
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
                    "object-contain p-10 sm:p-14 transition-transform duration-300 ease-out translate-z-0",
                    isZoomed ? "scale-135" : "scale-100"
                  )}
                  style={{
                    transformOrigin: isZoomed ? backgroundPosition : "center center",
                  }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />

                {/* Previous / Next Overlay Arrows on Main Gallery Image */}
                {normalizedImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full border border-zinc-200/90 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 text-zinc-700 dark:text-zinc-200 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#3e220f] hover:text-white hover:border-[#3e220f] transition-all duration-200 shadow-none cursor-pointer z-10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full border border-zinc-200/90 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 text-zinc-700 dark:text-zinc-200 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#3e220f] hover:text-white hover:border-[#3e220f] transition-all duration-200 shadow-none cursor-pointer z-10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Expandable "Click to Enlarge" Pill */}
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
              onClick={handlePrevImage}
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
              onClick={handleNextImage}
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
