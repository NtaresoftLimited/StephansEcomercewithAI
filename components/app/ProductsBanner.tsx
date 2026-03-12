"use client";

import * as React from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

const BANNERS = [
    "/Banners/Summit Banner.jpg.jpeg",
    "/Banners/Summit Banner 1.jpg.jpeg",
    "/Banners/Summit Banner 2.jpg.jpeg",
    "/Banners/Tropdpog Banner.jpg.jpeg",
];

export function ProductsBanner() {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
        Autoplay({ delay: 20000, stopOnInteraction: false }),
    ]);
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    const onSelect = React.useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    React.useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
    }, [emblaApi, onSelect]);

    return (
        <div className="relative w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {BANNERS.map((banner, index) => (
                        <div
                            key={banner}
                            className="relative flex-[0_0_100%] min-w-0 h-[250px] md:h-[400px] lg:h-[500px]"
                        >
                            <Image
                                src={banner}
                                alt={`Banner ${index + 1}`}
                                fill
                                priority={index === 0}
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {BANNERS.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => emblaApi?.scrollTo(index)}
                        className={cn(
                            "w-2.5 h-2.5 rounded-full transition-all duration-300",
                            selectedIndex === index
                                ? "bg-white w-8 shadow-md"
                                : "bg-white/50 hover:bg-white/80"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
