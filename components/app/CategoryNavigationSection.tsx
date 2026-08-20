import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const CategoryNavigationSection = () => {
  return (
    <section aria-label="Shop by category" className="bg-[#fbf8f5]">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        
        <div className="pt-16 md:pt-24 pb-12 text-center">
          <h3 className="text-[11px] font-bold tracking-[0.15em] text-[#c77e35] uppercase mb-4">
            FOR THEIR EVERY DAY
          </h3>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#222222] leading-tight">
            Everything they need,<br className="hidden sm:block" />chosen with care.
          </h2>
        </div>

        <div className="grid grid-cols-2 border-y border-[#e8e0d9] lg:grid-cols-5">
          
          {/* FOOD */}
          <Link href="/shop?category=food" className="group flex min-h-40 flex-col items-center justify-center px-3 py-6 text-center transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5e3c] focus-visible:ring-inset sm:min-h-44 sm:px-6 border-r border-[#e8e0d9] border-b lg:border-b-0">
            <span className="relative mb-5 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center transition-transform duration-300 group-hover:-translate-y-1">
              <div 
                className="w-full h-full bg-[#c77e35]" 
                style={{
                  WebkitMaskImage: 'url(/categories/Food_Stephans.png)',
                  maskImage: 'url(/categories/Food_Stephans.png)',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                }} 
              />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#28231f] sm:text-xs">
              FOOD
            </span>
            <span className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#5d554f] sm:text-sm">
              Shop now
              <span aria-hidden="true" className="text-base leading-none transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </Link>

          {/* TREATS */}
          <Link href="/shop?category=treats" className="group flex min-h-40 flex-col items-center justify-center px-3 py-6 text-center transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5e3c] focus-visible:ring-inset sm:min-h-44 sm:px-6 border-b lg:border-b-0 lg:border-r lg:border-[#e8e0d9]">
            <span className="relative mb-5 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center transition-transform duration-300 group-hover:-translate-y-1">
              <div 
                className="w-full h-full bg-[#c77e35]" 
                style={{
                  WebkitMaskImage: 'url(/categories/Treats_Stephans.png)',
                  maskImage: 'url(/categories/Treats_Stephans.png)',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                }} 
              />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#28231f] sm:text-xs">
              TREATS
            </span>
            <span className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#5d554f] sm:text-sm">
              Shop now
              <span aria-hidden="true" className="text-base leading-none transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </Link>

          {/* TOYS */}
          <Link href="/shop?category=toys" className="group flex min-h-40 flex-col items-center justify-center px-3 py-6 text-center transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5e3c] focus-visible:ring-inset sm:min-h-44 sm:px-6 border-r border-[#e8e0d9] border-b lg:border-b-0">
            <span className="relative mb-5 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center transition-transform duration-300 group-hover:-translate-y-1">
              <div 
                className="w-full h-full bg-[#c77e35]" 
                style={{
                  WebkitMaskImage: 'url(/categories/Toys_Stephans.png)',
                  maskImage: 'url(/categories/Toys_Stephans.png)',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                }} 
              />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#28231f] sm:text-xs">
              TOYS
            </span>
            <span className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#5d554f] sm:text-sm">
              Shop now
              <span aria-hidden="true" className="text-base leading-none transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </Link>

          {/* ACCESSORIES */}
          <Link href="/shop?category=accessories" className="group flex min-h-40 flex-col items-center justify-center px-3 py-6 text-center transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5e3c] focus-visible:ring-inset sm:min-h-44 sm:px-6 border-b lg:border-b-0 lg:border-r lg:border-[#e8e0d9]">
            <span className="relative mb-5 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center transition-transform duration-300 group-hover:-translate-y-1">
              <div 
                className="w-full h-full bg-[#c77e35]" 
                style={{
                  WebkitMaskImage: 'url(/categories/Accessories_Stephans.png)',
                  maskImage: 'url(/categories/Accessories_Stephans.png)',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                }} 
              />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#28231f] sm:text-xs">
              ACCESSORIES
            </span>
            <span className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#5d554f] sm:text-sm">
              Shop now
              <span aria-hidden="true" className="text-base leading-none transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </Link>

          {/* GROOMING */}
          <Link href="/grooming" className="group flex min-h-40 flex-col items-center justify-center px-3 py-6 text-center transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5e3c] focus-visible:ring-inset sm:min-h-44 sm:px-6 col-span-2 lg:col-span-1">
            <span className="relative mb-5 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center transition-transform duration-300 group-hover:-translate-y-1">
              <div 
                className="w-full h-full bg-[#c77e35]" 
                style={{
                  WebkitMaskImage: 'url(/categories/Grooming_Scissors.png)',
                  maskImage: 'url(/categories/Grooming_Scissors.png)',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                }} 
              />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#28231f] sm:text-xs">
              GROOMING
            </span>
            <span className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#5d554f] sm:text-sm">
              Book now
              <span aria-hidden="true" className="text-base leading-none transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </Link>

        </div>
      </div>
    </section>
  );
};
