"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
    return (
        <section className="relative w-full h-[700px] min-h-[700px] flex flex-col items-center justify-end pt-12 pb-16 md:pb-24 overflow-hidden bg-[#F7F3EE]">
            {/* Background Image */}
            <div className="absolute inset-0 z-0 bg-[#111111]">
                <Image
                    src="/hero-stephans.png"
                    alt="Happy pet, happy home"
                    fill
                    className="object-cover object-bottom opacity-80 brightness-[0.65]"
                    priority
                    quality={90}
                />
            </div>

            {/* Gradient Overlay for better text readability if needed (optional) */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#F7F3EE]/80 via-transparent to-transparent hidden" />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center text-center mt-8 px-4 max-w-4xl mx-auto drop-shadow-md">
                {/* Subtitle */}
                <h3 className="text-[11px] md:text-sm font-bold tracking-[0.2em] text-[#E8D1B5] uppercase mb-4 mt-8">
                    Happy Pet, Happy Home.
                </h3>

                {/* Main Title */}
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-[54px] font-serif text-white mb-4 md:mb-6 leading-tight whitespace-normal md:whitespace-nowrap">
                    Everything Your Pet Deserves.
                </h1>

                {/* Description */}
                <p className="text-gray-100 text-base md:text-xl max-w-lg mb-8 font-medium">
                    Premium pet food, accessories, <br className="hidden md:block" />
                    and professional grooming.
                </p>

                {/* Buttons */}
                <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 w-full px-2 sm:px-0">
                    <Button 
                        asChild 
                        className="flex-1 sm:flex-none h-auto bg-[#222222] hover:bg-black hover:text-white border-2 border-[#222222] hover:border-black text-white px-2 sm:px-6 py-3 sm:py-5 rounded-md text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1 sm:gap-2 group"
                    >
                        <Link href="/shop" className="text-center whitespace-normal flex items-center justify-center gap-3">
                            <Image
                                src="/icons/icon-shopping-bag.png"
                                alt=""
                                width={36}
                                height={36}
                                className="h-5 w-5 shrink-0 object-contain brightness-0 invert transition-transform group-hover:scale-110 sm:h-9 sm:w-9"
                            />
                            Shop Collection
                        </Link>
                    </Button>
                    <Button 
                        asChild 
                        variant="outline" 
                        className="flex-1 sm:flex-none h-auto bg-transparent hover:bg-white hover:text-black border-white border-2 text-white px-1 sm:px-6 py-3 sm:py-5 rounded-md text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1 sm:gap-2 group"
                    >
                        <Link href="/grooming" className="text-center whitespace-normal flex items-center justify-center gap-3">
                            <Image src="/calendar-stephans.svg" alt="Calendar" width={36} height={36} className="h-5 w-5 shrink-0 transition-all sm:h-9 sm:w-9" />
                            Book Grooming
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
