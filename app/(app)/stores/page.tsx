"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import Image from "next/image";
import { PawPrint } from "lucide-react";

// Dynamically import the StoreLocator component to avoid SSR issues with Leaflet
const StoreLocator = dynamic(
    () => import("@/components/app/StoreLocator").then((mod) => mod.StoreLocator),
    {
        ssr: false,
        loading: () => (
            <div className="h-[600px] w-full bg-zinc-100 animate-pulse rounded-lg flex items-center justify-center">
                <div className="text-zinc-400">Loading Map...</div>
            </div>
        ),
    }
);

export default function StoresPage() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePosition({ x, y });
    };

    return (
        <main className="min-h-screen bg-white">
            <div
                className="relative w-full py-24 text-center text-white overflow-hidden"
                onMouseMove={handleMouseMove}
            >
                {/* Animated Background Image */}
                <div
                    className="absolute inset-0 transition-transform duration-300 ease-out"
                    style={{
                        transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px) scale(1.1)`,
                    }}
                >
                    <Image
                        src="/Jonas walking Sky outside Stephan’s Pet Store.png"
                        alt="Stephan's Pet Store Locations"
                        fill
                        className="object-cover grayscale animate-[zoom_20s_ease-in-out_infinite_alternate]"
                        priority
                    />
                </div>

                {/* Brand Overlay - Lighter to show image */}
                <div className="absolute inset-0 bg-[#6b3e1e] mix-blend-multiply opacity-30" />

                {/* Paw Print Pattern Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="grid grid-cols-6 gap-8 p-4 rotate-12 scale-150 animate-[float_15s_ease-in-out_infinite]">
                        {Array.from({ length: 24 }).map((_, i) => (
                            <PawPrint key={i} className="w-16 h-16 text-white" />
                        ))}
                    </div>
                </div>
                <div className="pointer-events-none absolute inset-0">
                    <PawPrint className="absolute left-8 top-10 w-8 h-8 text-white animate-float" />
                    <PawPrint className="absolute right-12 top-20 w-10 h-10 text-white animate-float-delayed" />
                    <PawPrint className="absolute left-1/2 bottom-16 w-9 h-9 text-white animate-float" />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 drop-shadow-md animate-[fadeIn_1s_ease-in]">
                        Our Locations
                    </h1>
                    <p className="text-xl text-white/95 max-w-2xl mx-auto font-medium drop-shadow-sm animate-[fadeIn_1.5s_ease-in]">
                        Find a Stephan's Pet Store near you. Visit us for premium pet products,
                        grooming services, and expert advice.
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <StoreLocator />
            </div>
        </main>
    );
}
