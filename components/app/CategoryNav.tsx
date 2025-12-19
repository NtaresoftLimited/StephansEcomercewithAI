"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Home } from "lucide-react";
import type { ALL_CATEGORIES_QUERYResult } from "@/sanity.types";

interface CategoryNavProps {
    categories: ALL_CATEGORIES_QUERYResult;
    activeCategory?: string;
}

// Pet store category structure with subcategories
const petCategories = [
    {
        id: "dogs",
        title: "Dogs",
        slug: "dogs",
        subcategories: [
            { name: "Dog Food", slug: "dog-food" },
            { name: "Tick, Flea & Deworming", slug: "tick-flea-deworming" },
            { name: "Treats & Chews", slug: "treats-chews" },
            { name: "Beds & Blankets", slug: "beds-blankets" },
            { name: "Bowls & Fountains", slug: "bowls-fountains" },
            { name: "Collars, Leads & Harnesses", slug: "collars-leads" },
            { name: "Clothing & Fashion", slug: "clothing-fashion" },
            { name: "Grooming", slug: "grooming" },
            { name: "Hygiene & Cleaning", slug: "hygiene-cleaning" },
            { name: "Toys", slug: "toys" },
            { name: "Wellness & Supplements", slug: "wellness-supplements" },
            { name: "Training & Behaviour", slug: "training-behaviour" },
        ],
    },
    {
        id: "cats",
        title: "Cats",
        slug: "cats",
        subcategories: [
            { name: "Cat Food", slug: "cat-food" },
            { name: "Tick, Flea & Deworming", slug: "tick-flea-deworming" },
            { name: "Treats", slug: "treats" },
            { name: "Beds & Blankets", slug: "beds-blankets" },
            { name: "Bowls & Fountains", slug: "bowls-fountains" },
            { name: "Collars, Leads & Harnesses", slug: "collars-leads" },
            { name: "Grooming", slug: "grooming" },
            { name: "Cat Litter & Hygiene", slug: "cat-litter-hygiene" },
            { name: "Oral Care", slug: "oral-care" },
            { name: "Scratchers & Housing", slug: "scratchers-housing" },
            { name: "Toys", slug: "toys" },
            { name: "Travel Essentials", slug: "travel-essentials" },
        ],
    },
    {
        id: "birds",
        title: "Birds",
        slug: "birds",
        subcategories: [
            { name: "Bird Food", slug: "bird-food" },
            { name: "Cages & Housing", slug: "cages-housing" },
            { name: "Toys & Perches", slug: "toys-perches" },
            { name: "Health & Wellness", slug: "health-wellness" },
            { name: "Feeding Accessories", slug: "feeding-accessories" },
        ],
    },
    {
        id: "fish",
        title: "Fish",
        slug: "fish",
        subcategories: [
            { name: "Fish Food", slug: "fish-food" },
            { name: "Aquariums & Tanks", slug: "aquariums-tanks" },
            { name: "Filters & Pumps", slug: "filters-pumps" },
            { name: "Decorations", slug: "decorations" },
            { name: "Water Treatment", slug: "water-treatment" },
            { name: "Lighting", slug: "lighting" },
        ],
    },
    {
        id: "small-pets",
        title: "Small Pets",
        slug: "small-pets",
        subcategories: [
            { name: "Small Pet Food", slug: "small-pet-food" },
            { name: "Cages & Housing", slug: "cages-housing" },
            { name: "Bedding", slug: "bedding" },
            { name: "Toys & Accessories", slug: "toys-accessories" },
            { name: "Health & Wellness", slug: "health-wellness" },
        ],
    },
];

export function CategoryNav({ categories, activeCategory }: CategoryNavProps) {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    return (
        <nav className="bg-primary text-primary-foreground shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center h-12">
                    {/* Home icon */}
                    <Link
                        href="/"
                        className="flex items-center justify-center w-10 h-10 hover:bg-white/10 rounded-md transition-colors mr-2"
                    >
                        <Home className="h-5 w-5" />
                    </Link>

                    {/* Category dropdowns */}
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                        {petCategories.map((category) => (
                            <div
                                key={category.id}
                                className="relative"
                                onMouseEnter={() => setOpenDropdown(category.id)}
                                onMouseLeave={() => setOpenDropdown(null)}
                            >
                                {/* Main category button */}
                                <Link
                                    href={`/?category=${category.slug}`}
                                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium hover:bg-white/10 rounded-md transition-colors whitespace-nowrap ${activeCategory === category.slug ? "bg-white/20" : ""
                                        }`}
                                >
                                    {category.title.toUpperCase()}
                                    {category.subcategories.length > 0 && (
                                        <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === category.id ? "rotate-180" : ""}`} />
                                    )}
                                </Link>

                                {/* Dropdown menu */}
                                {category.subcategories.length > 0 && openDropdown === category.id && (
                                    <div className="absolute top-full left-0 w-64 bg-primary shadow-xl rounded-b-lg py-2 z-50 border-t border-white/10">
                                        {category.subcategories.map((subcat) => (
                                            <Link
                                                key={subcat.slug}
                                                href={`/?category=${category.slug}&sub=${subcat.slug}`}
                                                className="block px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                                            >
                                                {subcat.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}
