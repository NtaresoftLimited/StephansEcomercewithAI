"use client";

import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const REVIEWS = [
    {
        id: 1,
        text: "Really friendly and helpful people. And a really big and good organized store for all pet-owners, they have a big sortiment :)",
        name: "Jennifer Pannagl",
        time: "3 months ago",
        initial: "J",
        initialBg: "bg-blue-500"
    },
    {
        id: 2,
        text: "Best pet store in Dar! All tools, toys and shelters, many ideas (from their groceries) of how to spoin and/or assist the little companies at home. When I was there with my 3 y/o, the personnel was patient and very helpful, but also and mostly knowledgable. Will definitely return!",
        name: "Laura Sheïlla INANGOMA",
        time: "2 years ago",
        initial: "L",
        initialBg: "bg-amber-600"
    },
    {
        id: 3,
        text: "Amazing place with great customer service! My cats are loving their new supplies.",
        name: "Mark Hoffmann",
        time: "9 months ago",
        initial: "M",
        initialBg: "bg-slate-500"
    },
    {
        id: 4,
        text: "East Africa's Number One Pet Store, A Whole New Different Shopping Experience",
        name: "Manje Riziq",
        time: "2 years ago",
        initial: "M",
        initialBg: "bg-emerald-800"
    }
];

export function ReviewsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", skipSnaps: false },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  );

  return (
    <section className="pt-24 pb-12 bg-[#F8F5F0] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
            <h3 className="text-[11px] font-bold tracking-[0.15em] text-[#c77e35] uppercase mb-4">
                LOVED BY PET PARENTS
            </h3>
            <h2 className="text-4xl md:text-5xl font-serif text-[#222]">
                A little love, returned.
            </h2>
        </div>
        
        <div className="relative mx-auto group" ref={emblaRef}>
          <div className="flex -ml-4 touch-pan-y">
            {REVIEWS.map((review) => (
                <div 
                  key={review.id} 
                  className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4 relative transition-all duration-500 hover:!blur-0 hover:!opacity-100 group-hover:blur-[2px] group-hover:opacity-50 cursor-grab active:cursor-grabbing"
                >
                  <div className="flex flex-col text-center md:text-left px-4 md:px-8 h-full relative">
                      {/* Vertical divider for desktop (except first visual item, but in carousel it's tricky, let's just put it on the right side of each item) */}
                      <div className="hidden md:block absolute top-0 bottom-0 right-0 w-px bg-[#E8E0D8]"></div>

                      <div className="flex justify-center md:justify-start gap-1 mb-6 text-[#c77e35]">
                          {[...Array(5)].map((_, i) => (
                              <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                          ))}
                      </div>
                      <p className="text-xl md:text-2xl font-serif text-[#222] italic leading-tight mb-8">
                          "{review.text}"
                      </p>
                      <p className="text-sm text-[#666] mt-auto">— {review.name}</p>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
