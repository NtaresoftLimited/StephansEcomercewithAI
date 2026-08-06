"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
    return (
        <section className="relative w-full h-[700px] min-h-[700px] flex flex-col items-center justify-end pt-12 pb-16 md:pb-24 overflow-hidden bg-[#F7F3EE]">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/hero-bg.png"
                    alt="Happy pet, happy home"
                    fill
                    className="object-cover object-bottom opacity-75"
                    priority
                    quality={90}
                />
            </div>

            {/* Gradient Overlay for better text readability if needed (optional) */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#F7F3EE]/80 via-transparent to-transparent hidden" />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center text-center mt-8 px-4 max-w-4xl mx-auto">
                {/* Subtitle */}
                <h3 className="text-[11px] md:text-sm font-bold tracking-[0.2em] text-[#A66C44] uppercase mb-4 mt-8">
                    Happy Pet, Happy Home.
                </h3>

                {/* Main Title */}
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-[54px] font-serif text-[#222222] mb-4 md:mb-6 leading-tight whitespace-normal md:whitespace-nowrap">
                    Everything Your Pet Deserves.
                </h1>

                {/* Description */}
                <p className="text-[#444444] text-base md:text-xl max-w-lg mb-8 font-medium">
                    Premium pet food, accessories, <br className="hidden md:block" />
                    and professional grooming.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <Button 
                        asChild 
                        className="w-full sm:w-auto bg-[#222222] hover:bg-primary hover:text-primary-foreground border-2 border-[#222222] hover:border-primary text-white px-8 py-6 rounded-md text-sm font-semibold transition-colors"
                    >
                        <Link href="/shop">
                            Shop Collection
                        </Link>
                    </Button>
                    <Button 
                        asChild 
                        variant="outline" 
                        className="w-full sm:w-auto bg-transparent hover:bg-primary hover:text-primary-foreground hover:border-primary border-[#222222] border-2 text-[#222222] px-8 py-6 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 group"
                    >
                        <Link href="/grooming">
                            <Image src="/calendar-stephans.svg" alt="Calendar" width={26} height={26} className="mr-1" />
                            Book Grooming
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
