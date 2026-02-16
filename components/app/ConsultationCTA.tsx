"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const BUNDLE_IMAGES = [
  "/OFP-Mobile-Bundle-for-Dog-5-412x600.png",
  "/OFP-Bundle-for-Cat-3-412x600.png",
  "/OFP-Bundle-for-Dog-4-412x600.png",
  "/OFP-Mobile-Bundle-for-Dog-1-412x600.png"
];

export function ConsultationCTA() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % BUNDLE_IMAGES.length);
    }, 20000); // Change every 20 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full bg-secondary overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between min-h-[300px]">
          {/* Text Content */}
          <div className="flex-1 px-8 py-8 md:py-16 md:pl-16 lg:pl-24 flex flex-col items-start gap-6 z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground max-w-xl leading-tight">
              Not sure what’s right for your pet?
            </h2>
            
            <Link href="/contact">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-sm font-bold tracking-wider rounded-md uppercase"
              >
                Contact Us
              </Button>
            </Link>
          </div>

          {/* Image Content */}
          <div className="relative w-full md:w-1/2 h-[300px] md:h-[400px] flex items-end justify-center">
             {/* Green Question Marks Decoration - positioned absolutely relative to the container */}
             <div className="absolute inset-0 pointer-events-none z-10">
                {/* We can use SVGs or just simple text for the question marks as seen in the design */}
                <div className="absolute top-1/4 left-1/4 text-muted-foreground/40 text-6xl font-serif rotate-[-15deg]">?</div>
                <div className="absolute top-1/3 right-1/3 text-muted-foreground/40 text-5xl font-serif rotate-[15deg]">?</div>
                <div className="absolute bottom-1/3 left-1/3 text-muted-foreground/40 text-5xl font-serif rotate-[-25deg]">?</div>
             </div>

            <div className="relative w-full h-full flex items-end justify-center">
              {BUNDLE_IMAGES.map((src, index) => (
                <div 
                  key={src}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-end justify-center",
                    index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                  )}
                >
                  <div className="relative w-full h-full max-w-[400px] max-h-[500px]">
                    <Image
                      src={src}
                      alt={`Pet Bundle ${index + 1}`}
                      fill
                      className="object-contain object-bottom"
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
