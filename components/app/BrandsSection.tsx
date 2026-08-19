"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function BrandsSection() {
  return (
    <section className="py-10 md:py-16 bg-white">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#c77e35] uppercase mb-10">
          TRUSTED BRANDS
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 items-center justify-items-center mb-10">
          <Image 
            src="/brands/Bioline.webp" 
            alt="Bioline" 
            width={140} 
            height={50} 
            className="object-contain h-10 md:h-12 lg:h-14 w-auto mix-blend-multiply" 
          />
          <Image 
            src="/brands/Summit-10.svg" 
            alt="Summit10" 
            width={140} 
            height={50} 
            className="object-contain h-10 md:h-12 lg:h-14 w-auto" 
          />
          <Image 
            src="/brands/TropiDog_logo.svg" 
            alt="TropiDog" 
            width={140} 
            height={50} 
            className="object-contain h-10 md:h-12 lg:h-14 w-auto" 
          />
          <Image 
            src="/brands/TropiCat_logo.svg" 
            alt="TropiCat" 
            width={140} 
            height={50} 
            className="object-contain h-10 md:h-12 lg:h-14 w-auto" 
          />
        </div>

        <Link 
          href="/allbrands" 
          className="inline-flex items-center gap-2 text-[13px] font-bold text-[#222] hover:text-[#c77e35] transition-colors uppercase tracking-wide"
        >
          View All Brands
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
