"use client";

import { Check, Dog, Cat } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { PRICES, DOG_PACKAGES, CAT_PACKAGES, SIZE_LABELS } from "@/lib/constants/grooming";

function formatPrice(price: number) {
    return new Intl.NumberFormat("en-TZ", {
        style: "decimal",
        minimumFractionDigits: 0,
    }).format(price) + " TZS";
}

interface PackageCardProps {
    packageKey: "standard" | "premium" | "super_premium";
    name: string;
    prices: Record<string, number>;
    services: string[];
    color: string;
    popular?: boolean;
    petType: "dog" | "cat";
}

function PackageCard({ packageKey, name, prices, services, color, popular, petType }: PackageCardProps) {
    const priceEntries = Object.entries(prices);

    return (
        <div className={`relative rounded-2xl bg-white dark:bg-zinc-900 shadow-xl overflow-hidden ${popular ? "ring-2 ring-[#6b3e1e]" : ""}`}>
            {popular && (
                <div className="absolute top-0 right-0 bg-[#6b3e1e] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    MOST POPULAR
                </div>
            )}

            <div className={`bg-gradient-to-r ${color} p-6 text-white`}>
                <h3 className="text-xl font-bold">{name}</h3>
            </div>

            <div className="p-6">
                {/* Prices */}
                <div className="mb-6 space-y-2">
                    {priceEntries.map(([size, price]) => (
                        <Link
                            key={size}
                            href={`?petType=${petType}&package=${packageKey}&size=${size}#booking`}
                            className="flex justify-between items-center rounded-lg px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                {SIZE_LABELS[size]}
                            </span>
                            <span className="font-bold text-zinc-900 dark:text-white">
                                {formatPrice(price)}
                            </span>
                        </Link>
                    ))}
                </div>

                {/* Services */}
                <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                        Services Included:
                    </p>
                    <ul className="space-y-2">
                        {services.map((service, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                <Check className="h-4 w-4 text-[#6b3e1e] mt-0.5 shrink-0" />
                                {service}
                            </li>
                        ))}
                    </ul>
                </div>

                <Link
                    href={`?petType=${petType}&package=${packageKey}#booking`}
                    className={`mt-6 block w-full rounded-lg bg-gradient-to-r ${color} py-3 text-center font-semibold text-white transition-all hover:opacity-90`}
                >
                    Book Now
                </Link>
            </div>
        </div>
    );
}

interface GroomingPackagesProps {
    prices?: typeof PRICES;
}

export function GroomingPackages({ prices = PRICES }: GroomingPackagesProps) {
    const [activeTab, setActiveTab] = useState<"dog" | "cat">("dog");

    const getPackage = (petType: "dog" | "cat", pkgKey: "standard" | "premium" | "super_premium") => {
        const pkgData = petType === "dog" ? DOG_PACKAGES[pkgKey] : CAT_PACKAGES[pkgKey];
        const dynamicPrices = prices?.[petType]?.[pkgKey];
        
        return {
            ...pkgData,
            prices: dynamicPrices || pkgData.prices
        };
    };

    return (
        <section id="packages" className="py-16 px-4 bg-[#f5ebe0]/50 dark:bg-zinc-900/50">
            <div className="mx-auto max-w-6xl">
                <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-white mb-4">
                    Our Grooming Packages
                </h2>
                <p className="text-center text-zinc-600 dark:text-zinc-400 mb-8">
                    Choose the perfect package for your furry friend
                </p>

                {/* Pet Type Tabs */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex rounded-full bg-zinc-100 dark:bg-zinc-800 p-1">
                        <button
                            onClick={() => setActiveTab("dog")}
                            className={`flex items-center gap-2 rounded-full px-6 py-2 font-semibold transition-all ${activeTab === "dog"
                                ? "bg-white dark:bg-zinc-700 text-[#6b3e1e] shadow-md"
                                : "text-zinc-500 hover:text-zinc-700"
                                }`}
                        >
                            <Dog className="h-5 w-5" />
                            Dogs
                        </button>
                        <button
                            onClick={() => setActiveTab("cat")}
                            className={`flex items-center gap-2 rounded-full px-6 py-2 font-semibold transition-all ${activeTab === "cat"
                                ? "bg-white dark:bg-zinc-700 text-[#6b3e1e] shadow-md"
                                : "text-zinc-500 hover:text-zinc-700"
                                }`}
                        >
                            <Cat className="h-5 w-5" />
                            Cats
                        </button>
                    </div>
                </div>

                {/* Package Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    {activeTab === "dog" ? (
                        <>
                            <PackageCard petType="dog" packageKey="standard" {...getPackage("dog", "standard")} />
                            <PackageCard petType="dog" packageKey="premium" {...getPackage("dog", "premium")} />
                            <PackageCard petType="dog" packageKey="super_premium" {...getPackage("dog", "super_premium")} />
                        </>
                    ) : (
                        <>
                            <PackageCard petType="cat" packageKey="standard" {...getPackage("cat", "standard")} />
                            <PackageCard petType="cat" packageKey="premium" {...getPackage("cat", "premium")} />
                            <PackageCard petType="cat" packageKey="super_premium" {...getPackage("cat", "super_premium")} />
                        </>
                    )}
                </div>

                {/* Additional Charges */}
                <div className="mt-12 rounded-xl bg-white dark:bg-zinc-800/50 p-6 border border-[#6b3e1e]/20">
                    <h3 className="font-bold text-zinc-900 dark:text-white mb-4">
                        Additional Charges
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex justify-between">
                            <span className="text-zinc-600 dark:text-zinc-400">Detangling Hair</span>
                            <span className="font-semibold text-[#6b3e1e]">30,000 TZS</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-600 dark:text-zinc-400">Emergency (after 6:30 PM)</span>
                            <span className="font-semibold text-[#6b3e1e]">30,000 TZS</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-600 dark:text-zinc-400">Handling Fee</span>
                            <span className="font-semibold text-[#6b3e1e]">10,000 TZS</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-600 dark:text-zinc-400">Sedation (Vet Supervision)</span>
                            <span className="font-semibold text-[#6b3e1e]">5,000 TZS</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-600 dark:text-zinc-400">Late Pickup (per hour)</span>
                            <span className="font-semibold text-[#6b3e1e]">10,000 TZS</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
