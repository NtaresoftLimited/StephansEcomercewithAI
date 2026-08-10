"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function BrandsSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#A66C44] uppercase mb-12">
          TRUSTED BRANDS
        </h3>
        
        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 lg:gap-28 mb-12">
          <Image 
            src="/brands/Bioline.webp" 
            alt="Bioline" 
            width={120} 
            height={50} 
            className="object-contain h-10 md:h-12 w-auto mix-blend-multiply" 
          />
          <Image 
            src="/brands/Summit-10.svg" 
            alt="Summit10" 
            width={120} 
            height={50} 
            className="object-contain h-10 md:h-12 w-auto" 
          />
          <Image 
            src="/brands/TropiDog_logo.svg" 
            alt="TropiDog" 
            width={120} 
            height={50} 
            className="object-contain h-10 md:h-12 w-auto" 
          />
          <Image 
            src="/brands/TropiCat_logo.svg" 
            alt="TropiCat" 
            width={120} 
            height={50} 
            className="object-contain h-10 md:h-12 w-auto" 
          />
        </div>

        <Link 
          href="/shop" 
          className="inline-flex items-center gap-2 text-[13px] font-bold text-[#222] hover:text-[#A66C44] transition-colors uppercase tracking-wide"
        >
          View All Brands
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
