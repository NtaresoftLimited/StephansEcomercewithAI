"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface GroomingSectionProps {
    images?: string[];
}

const DEFAULT_IMAGES = [
    "/grooming-1.jpg",
    "/grooming-2.png",
    "/grooming-3.png",
];

const getOptimizedSanityUrl = (url: string, size = 1200): string => {
    if (!url.includes("cdn.sanity.io")) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}w=${size}&fit=crop&q=80&auto=format`;
};

export function GroomingSection({ images }: GroomingSectionProps) {
    // Use the provided image from the user for the banner
    const bgImage = "/grooming-banner.png";

    return (
        <section className="w-full bg-[#fdfbf9] relative overflow-hidden">
            {/* Background Image on the right */}
            <div className="absolute inset-0 z-0 flex justify-end">
                <div className="relative w-full md:w-[65%] h-full">
                    <Image
                        src={bgImage}
                        alt="Professional Grooming"
                        fill
                        className="object-cover object-center"
                    />
                    {/* Gradient Fade from Left */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#fdfbf9] via-[#fdfbf9]/90 to-transparent" />
                </div>
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="max-w-xl">
                    <h3 className="text-[12px] font-bold tracking-[0.2em] text-[#c77e35] uppercase mb-4">
                        GROOMING STUDIO
                    </h3>
                    <h2 className="text-4xl md:text-5xl lg:text-[56px] font-serif text-[#222222] mb-6 leading-tight">
                        Professional Grooming
                    </h2>
                    <p className="text-base md:text-lg text-[#555555] mb-8 leading-relaxed max-w-sm">
                        Every appointment is tailored to your pet, with gentle handling and experienced groomers.
                    </p>
                    <Button
                        asChild
                        className="bg-[#222222] hover:bg-black text-white px-8 py-6 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 w-fit"
                    >
                        <Link href="/grooming">
                            Book Appointment
                            <Image 
                                src="/calendar-stephans.svg" 
                                alt="Calendar" 
                                width={32} 
                                height={32} 
                                className="ml-1 w-8 h-8 object-contain" 
                            />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
