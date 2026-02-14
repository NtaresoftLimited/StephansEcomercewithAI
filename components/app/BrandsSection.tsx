"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { odoo } from "@/lib/odoo/client";

interface Brand {
    id: number;
    name: string;
    logo?: string;
}

export function BrandsSection({ brands }: { brands: Brand[] }) {
    if (!brands || brands.length === 0) return null;

    return (
        <section className="py-16 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Our Brands
                    </h2>
                    <p className="mt-4 text-lg text-gray-500">
                        Trusted by pet parents, approved by pets.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
                    {brands.map((brand) => (
                        <Link
                            key={brand.id}
                            href={`/brands/${brand.name.toLowerCase().replace(/\s+/g, '-')}`}
                            className="flex items-center justify-center p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-all duration-300 group hover:bg-white border border-transparent hover:border-gray-100"
                        >
                            <div className="relative w-full h-24 flex items-center justify-center">
                                {brand.logo ? (
                                    <img
                                        src={`data:image/png;base64,${brand.logo}`}
                                        alt={brand.name}
                                        className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                                    />
                                ) : (
                                    <span className="text-lg font-semibold text-gray-400 group-hover:text-primary transition-colors">
                                        {brand.name}
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
