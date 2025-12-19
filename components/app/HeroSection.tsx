"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
    heroImageUrl?: string | null;
}

export function HeroSection({ heroImageUrl }: HeroSectionProps) {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 mb-8 md:mb-12 lg:mb-16">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-amber-500 animate-float" />
                <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-orange-500 animate-float-delayed" />
                <div className="absolute bottom-20 left-1/4 w-20 h-20 rounded-full bg-amber-400 animate-float" />
            </div>

            <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
                <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
                    {/* Content */}
                    <div className="text-center lg:text-left animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <Heart className="h-4 w-4" />
                            <span>Premium Pet Care Since 2015</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight mb-6">
                            Everything Your
                            <span className="text-amber-600 dark:text-amber-400 block">Pet Deserves</span>
                        </h1>

                        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto lg:mx-0 mb-8">
                            Discover premium food, cozy beds, engaging toys, and essential accessories
                            for your beloved companions. Quality products, expert care.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link href="/">
                                <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200/50 transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-xl hover:shadow-amber-300/50 dark:shadow-amber-900/30 px-8 py-6 text-lg">
                                    Shop Now
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/studio">
                                <Button variant="outline" className="px-8 py-6 text-lg border-2">
                                    Learn More
                                </Button>
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-8 mt-12 justify-center lg:justify-start">
                            {[
                                { value: "5000+", label: "Happy Pets" },
                                { value: "500+", label: "Products" },
                                { value: "8+", label: "Years" },
                            ].map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stat.value}</div>
                                    <div className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hero Image */}
                    {heroImageUrl && (
                        <div className="relative hidden lg:block">
                            <div className="relative z-10">
                                <Image
                                    src={heroImageUrl}
                                    alt="Happy pet"
                                    width={600}
                                    height={500}
                                    className="rounded-2xl shadow-2xl animate-fade-in object-cover"
                                    priority
                                />
                            </div>
                            <div className="absolute top-10 right-10 w-full h-full bg-amber-200/30 dark:bg-amber-900/20 rounded-2xl -z-10" />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
