"use client";

import React from "react";

const REVIEWS = [
    {
        id: 1,
        text: "Really friendly and helpful people. And a really big and good organized store for all pet-owners, they have a big sortiment :)",
        name: "Jennifer Pannagl"
    },
    {
        id: 2,
        text: "Best pet store in Dar! All tools, toys and shelters, many ideas (from their groceries) of how to spoin and/or assist the little companies at home. When I was there with my 3 y/o, the personnel was patient and very helpful, but also and mostly knowledgable. Will definitely return!",
        name: "Laura Sheïlla INANGOMA"
    },
    {
        id: 3,
        text: "Amazing place with great customer service! My cats are loving their new supplies.",
        name: "Mark Hoffmann"
    },
    {
        id: 4,
        text: "East Africa's Number One Pet Store, A Whole New Different Shopping Experience",
        name: "Manje Riziq"
    }
];

export function GroomingTestimonialsSection() {
    return (
        <section className="pt-24 pb-12 bg-[#F8F5F0]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h3 className="text-[11px] font-bold tracking-[0.15em] text-[#c77e35] uppercase mb-4">
                        LOVED BY PET PARENTS
                    </h3>
                    <h2 className="text-4xl md:text-5xl font-serif text-[#222]">
                        A little love, returned.
                    </h2>
                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-16 gap-x-8 lg:gap-x-16 relative">
                    {/* Vertical divider for desktop */}
                    <div className="hidden md:block absolute top-0 bottom-0 left-[50%] w-px bg-[#E8E0D8]"></div>

                    {REVIEWS.map((review, index) => (
                        <div key={review.id} className="flex flex-col text-center md:text-left px-4 md:px-8">
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
                    ))}
                </div>
            </div>
        </section>
    );
}
