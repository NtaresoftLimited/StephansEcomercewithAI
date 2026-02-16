"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GroomingSectionProps {
    images?: string[];
}

// Default fallback images if none from CMS
const DEFAULT_IMAGES = [
    "/grooming-1.jpg",
    "/grooming-2.png",
    "/grooming-3.png",
];

export function GroomingSection({ images }: GroomingSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const backgroundImages = images && images.length > 0 ? images : DEFAULT_IMAGES;

    // Auto-rotate images every 5 seconds
    useEffect(() => {
        if (backgroundImages.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % backgroundImages.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [backgroundImages.length]);

    return (
        <section className="w-full">
            <div className="relative overflow-hidden bg-primary/90 py-16 md:py-20">
                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
                        <div className="max-w-xl space-y-6 text-primary-foreground text-center md:text-left">
                            <h2 className="text-3xl font-medium tracking-wide sm:text-4xl lg:text-5xl">
                                Spoil Your Pet
                            </h2>
                            <p className="text-lg text-primary-foreground/80 font-light leading-relaxed">
                                Professional grooming services to keep your furry friend looking
                                and feeling their best. From baths to full spa treatments.
                            </p>
                            <div className="pt-4">
                                <Button
                                    asChild
                                    size="lg"
                                    className="rounded-full bg-background text-foreground hover:bg-background/90 px-8 py-6 text-sm font-medium tracking-widest uppercase transition-all"
                                >
                                    <Link href="/grooming" className="flex items-center gap-2">
                                        Book Appointment
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Minimalist Image Display */}
                        <div className="relative h-64 w-64 shrink-0 sm:h-80 sm:w-80 overflow-hidden rounded-full">
                            <div className="absolute inset-0 bg-background/10 mix-blend-overlay z-10" />
                            <Image
                                src={backgroundImages[currentIndex]}
                                alt="Professional grooming"
                                fill
                                className="object-cover transition-transform duration-1000 ease-in-out scale-105"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
