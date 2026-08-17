import React from 'react';
import Link from 'next/link';
import { FoodBowlIcon, BoneIcon, TeddyBearIcon, CollarIcon, ScissorsBubblesIcon } from '@/components/app/CustomIcons';

export const CategoryNavigationSection = () => {
  return (
    <section className="py-20 md:py-28 bg-[#FAF7F2] border-t border-[#EAE3D9]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#222222] text-center mb-16 leading-tight">
          Everything they need,<br className="hidden sm:block" />
          chosen with care.
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-y-12 gap-x-0 relative">
          
          {/* FOOD */}
          <Link href="/shop?category=food" className="flex flex-col items-center group relative w-full px-4 text-center md:border-r md:border-[#EAE3D9] last:border-r-0">
            <div className="h-20 flex items-center justify-center mb-4 transition-transform group-hover:-translate-y-1">
              <FoodBowlIcon className="w-14 h-14 text-[#4E2A15]" />
            </div>
            <h3 className="text-xs font-bold tracking-widest text-[#222222] uppercase mb-2">Food</h3>
            <span className="text-sm text-zinc-600 flex items-center gap-1 group-hover:text-zinc-900 transition-colors">
              Shop now <span aria-hidden="true">&rarr;</span>
            </span>
          </Link>

          {/* TREATS */}
          <Link href="/shop?category=treats" className="flex flex-col items-center group relative w-full px-4 text-center md:border-r md:border-[#EAE3D9] last:border-r-0">
            <div className="h-20 flex items-center justify-center mb-4 transition-transform group-hover:-translate-y-1">
              <BoneIcon className="w-14 h-14 text-[#4E2A15]" />
            </div>
            <h3 className="text-xs font-bold tracking-widest text-[#222222] uppercase mb-2">Treats</h3>
            <span className="text-sm text-zinc-600 flex items-center gap-1 group-hover:text-zinc-900 transition-colors">
              Shop now <span aria-hidden="true">&rarr;</span>
            </span>
          </Link>

          {/* TOYS */}
          <Link href="/shop?category=toys" className="flex flex-col items-center group relative w-full px-4 text-center md:border-r md:border-[#EAE3D9] last:border-r-0">
            <div className="h-20 flex items-center justify-center mb-4 transition-transform group-hover:-translate-y-1">
              <TeddyBearIcon className="w-14 h-14 text-[#4E2A15]" />
            </div>
            <h3 className="text-xs font-bold tracking-widest text-[#222222] uppercase mb-2">Toys</h3>
            <span className="text-sm text-zinc-600 flex items-center gap-1 group-hover:text-zinc-900 transition-colors">
              Shop now <span aria-hidden="true">&rarr;</span>
            </span>
          </Link>

          {/* ACCESSORIES */}
          <Link href="/shop?category=accessories" className="flex flex-col items-center group relative w-full px-4 text-center md:border-r md:border-[#EAE3D9] last:border-r-0">
            <div className="h-20 flex items-center justify-center mb-4 transition-transform group-hover:-translate-y-1">
              <CollarIcon className="w-14 h-14 text-[#4E2A15]" />
            </div>
            <h3 className="text-xs font-bold tracking-widest text-[#222222] uppercase mb-2">Accessories</h3>
            <span className="text-sm text-zinc-600 flex items-center gap-1 group-hover:text-zinc-900 transition-colors">
              Shop now <span aria-hidden="true">&rarr;</span>
            </span>
          </Link>

          {/* GROOMING */}
          <Link href="/grooming" className="flex flex-col items-center group relative w-full px-4 text-center">
            <div className="h-20 flex items-center justify-center mb-4 transition-transform group-hover:-translate-y-1">
              <ScissorsBubblesIcon className="w-14 h-14 text-[#4E2A15]" />
            </div>
            <h3 className="text-xs font-bold tracking-widest text-[#222222] uppercase mb-2">Grooming</h3>
            <span className="text-sm text-zinc-600 flex items-center gap-1 group-hover:text-zinc-900 transition-colors">
              Book now <span aria-hidden="true">&rarr;</span>
            </span>
          </Link>

        </div>
      </div>
    </section>
  );
};
