"use client";

import {
  ArrowRight,
  Baby,
  Bed,
  Bone,
  Brain,
  Car,
  CircleDot,
  Dumbbell,
  HeartPulse,
  Home,
  Refrigerator,
  Scissors,
  Shield,
  ShieldCheck,
  Shirt,
  Sparkles,
  Trash2,
  Utensils,
  Wind,
} from "lucide-react";
import Link from "next/link";
import type { ElementType } from "react";

type MenuGroup = {
  title: string;
  href: string;
  items: Array<{ name: string; href: string }>;
};

interface CategoryMegaMenuProps {
  animalName: string;
  groups: MenuGroup[];
  featuredTitles: readonly string[];
  viewAllHref: string;
  onNavigate: () => void;
}

const CATEGORY_ICONS: Record<string, ElementType> = {
  "Dog Food": Utensils,
  "Cat Food": Utensils,
  "Bird Food": Utensils,
  Food: Utensils,
  "Tick, Flea & Deworming": ShieldCheck,
  "Wellness & Supplements": HeartPulse,
  "Treats & Chews": Bone,
  "Treats & Supplements": Bone,
  "Oral Care": Sparkles,
  "Grooming Essentials": Scissors,
  "Hygiene & Care": Scissors,
  "Hygiene & Cleaning": Scissors,
  "Clean Living": Trash2,
  "Cat Litter & Clean Living": Trash2,
  "Bowls & Feeders": Refrigerator,
  "Beds & Blankets": Bed,
  "Home & Crates": Home,
  "Homes & Nests": Home,
  "Little Homes": Home,
  "Scratchers & Cat Housing": Home,
  "Toys & Plays": Dumbbell,
  "Toys & Enrichment": Dumbbell,
  "Collars, Harnesses & Leads": Shield,
  "Collars & Harnesses": Shield,
  "Perches & Accessories": Wind,
  "Pet Apparel": Shirt,
  "Training & Behavior": Brain,
  "Travel Essentials": Car,
  "Kitten Essentials": Baby,
  "Puppy Essentials": Baby,
};

export function CategoryMegaMenu({
  animalName,
  groups,
  featuredTitles,
  viewAllHref,
  onNavigate,
}: CategoryMegaMenuProps) {
  const featuredGroups = featuredTitles
    .map((title) => groups.find((group) => group.title === title))
    .filter((group): group is MenuGroup => Boolean(group));

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="bg-[#fffdfb] dark:bg-zinc-950">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 lg:p-6">
          {featuredGroups.map((group) => {
            const Icon = CATEGORY_ICONS[group.title] || CircleDot;

            return (
              <article
                key={group.title}
                className="group/card flex flex-col min-h-[200px] gap-4 rounded-xl border border-[#6b3e1e]/10 bg-white p-5 transition-all duration-200 hover:border-[#9a5d2d]/30 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#6b3e1e]/5 text-[#6b3e1e] transition-colors group-hover/card:bg-[#6b3e1e]/10 dark:bg-amber-950/25 dark:text-amber-500">
                    <Icon aria-hidden="true" className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  <Link
                    href={group.href}
                    onClick={onNavigate}
                    className="text-lg font-bold text-zinc-950 transition-colors hover:text-[#8b4f22] dark:text-white dark:hover:text-amber-500 line-clamp-2"
                  >
                    {group.title}
                  </Link>
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <ul className="mt-2 space-y-2.5">
                    {group.items.slice(0, 4).map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          className="inline-block text-[14px] font-medium text-zinc-600 transition-colors hover:text-[#8b4f22] dark:text-zinc-400 dark:hover:text-amber-500 truncate w-full"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto border-t border-[#6b3e1e]/10 pt-3 dark:border-zinc-800">
                    <Link
                      href={group.href}
                      onClick={onNavigate}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6b3e1e] transition-colors hover:text-[#9a5d2d] dark:text-amber-500"
                    >
                      View all
                      <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="flex justify-center border-t border-[#6b3e1e]/10 bg-[#fbf7f3] px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/70">
          <Link
            href={viewAllHref}
            onClick={onNavigate}
            className="inline-flex min-w-72 items-center justify-center gap-3 rounded-full bg-[#6b3e1e] px-8 py-3 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#573017] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b3e1e] focus-visible:ring-offset-2"
          >
            View all {animalName} categories
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
