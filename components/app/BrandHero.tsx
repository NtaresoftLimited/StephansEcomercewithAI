"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const BRAND_BANNERS = [
  "/Banners/Summit Banner.jpg.jpeg",
  "/Banners/Summit Banner 1.jpg.jpeg",
  "/Banners/Summit Banner 2.jpg.jpeg",
  "/Banners/Bioline Banner.jpg",
  "/Banners/Bioline Bannerr.jpg",
  "/Banners/Tropidog Banner.jpg",
  "/Banners/Tropidog banner 2.png",
  "/Banners/Tropicat Banner.jpg",
];

export function BrandHero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (BRAND_BANNERS.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % BRAND_BANNERS.length);
        setIsTransitioning(false);
      }, 1000); // 1s transition
    }, 6000); // Change image every 6 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
      {/* Background Images */}
      {BRAND_BANNERS.map((banner, index) => (
        <div
          key={banner}
          className={cn(
            "absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out transform scale-105",
            index === currentImageIndex ? "opacity-100 scale-100" : "opacity-0"
          )}
          style={{ backgroundImage: `url('${banner}')` }}
        />
      ))}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white uppercase">
            Our Brands
          </h1>
          <div className="w-24 h-1.5 bg-[#c77e35] mx-auto rounded-full" />
          <p className="text-lg md:text-xl text-zinc-200 font-medium">
            Discover premium products from our trusted partners.
          </p>
        </div>
      </div>
    </section>
  );
}
