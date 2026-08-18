"use client";

import React from "react";

const REVIEWS = [
    {
        id: 1,
        text: "They always know exactly what my cat needs.",
        name: "Hamza A."
    },
    {
        id: 2,
        text: "The kind of place you trust with them.",
        name: "Neema K."
    },
    {
        id: 3,
        text: "Beautiful products and genuinely thoughtful service.",
        name: "Asha M."
    }
];

export function GroomingTestimonialsSection() {
    return (
        <section className="pt-24 pb-12 bg-[#F8F5F0]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h3 className="text-[11px] font-bold tracking-[0.15em] text-[#A66C44] uppercase mb-4">
                        LOVED BY PET PARENTS
                    </h3>
                    <h2 className="text-4xl md:text-5xl font-serif text-[#222]">
                        A little love, returned.
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-16 relative">
                    {/* Vertical dividers for desktop */}
                    <div className="hidden md:block absolute top-0 bottom-0 left-[33%] w-px bg-[#E8E0D8]"></div>
                    <div className="hidden md:block absolute top-0 bottom-0 left-[66%] w-px bg-[#E8E0D8]"></div>

                    {REVIEWS.map((review) => (
                        <div key={review.id} className="flex flex-col text-center md:text-left px-4 md:px-8">
                            <div className="flex justify-center md:justify-start gap-1 mb-6 text-[#A66C44]">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-xl md:text-2xl font-serif text-[#222] italic leading-tight mb-8">
                                "{review.text}"
                            </p>
                            <p className="text-sm text-[#666] mt-auto">— {review.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
