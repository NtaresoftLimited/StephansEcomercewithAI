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

const CATEGORY_ICONS: Record<string, ElementType | string> = {
  "Dog Food": "/icons/pet-bowl.png",
  "Cat Food": "/icons/pet-bowl.png",
  "Bird Food": Utensils,
  Food: "/icons/pet-bowl.png",
  "Tick, Flea & Deworming": "/icons/shield-tick.png",
  "Wellness & Supplements": HeartPulse,
  "Treats & Chews": "/icons/Treats_Stephans.png",
  Treats: "/icons/Treats_Stephans.png",
  "Treats & Supplements": "/icons/Treats_Stephans.png",
  "Oral Care": Sparkles,
  "Grooming Essentials": "/icons/hairbrush.png",
  "Hygiene & Care": Scissors,
  "Hygiene & Cleaning": Scissors,
  "Clean Living": Trash2,
  "Cat Litter & Clean Living": Trash2,
  "Bowls & Feeders": "/icons/pet-bowl.png",
  "Beds & Blankets": Bed,
  "Home & Crates": Home,
  "Homes & Nests": Home,
  "Little Homes": Home,
  "Home & Habitat": "/icons/small-pets-home.png",
  "Home": "/icons/bird-house.png",
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
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-zinc-950">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 -mx-5 py-4 lg:py-6 pb-2">
          {featuredGroups.map((group) => {
            const Icon = CATEGORY_ICONS[group.title] || CircleDot;

            return (
              <article
                key={group.title}
                className="group/card flex flex-col min-h-[200px] gap-4 rounded-xl border border-transparent bg-transparent p-5 transition-all duration-200 hover:border-[#c77e35]/10 dark:hover:border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex shrink-0 items-center justify-center text-[#c77e35] dark:text-amber-500">
                    {typeof Icon === 'string' ? ( <div className="h-7 w-7 bg-[#c77e35] dark:bg-amber-500" style={{ WebkitMaskImage: `url('${Icon}')`, maskImage: `url('${Icon}')`, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center" }} /> ) : ( <Icon aria-hidden="true" className="h-7 w-7 stroke-[1]" /> )}
                  </div>
                  <Link
                    href={group.href}
                    onClick={onNavigate}
                    className="text-lg font-bold text-zinc-950 transition-colors hover:text-[#8b4f22] dark:text-white dark:hover:text-amber-500 line-clamp-2"
                  >
                    {group.title}
                  </Link>
                </div>

                <div className="flex min-w-0 flex-1 flex-col pl-10">
                  <ul className="mt-1 space-y-2.5">
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

                  <div className="mt-auto pt-3">
                    <Link
                      href={group.href}
                      onClick={onNavigate}
                      className="inline-flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wider text-[#c77e35] transition-colors hover:text-[#9a5d2d] dark:text-amber-500"
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

        <div className="flex justify-start pb-6 pt-2">
          <Link
            href={viewAllHref}
            onClick={onNavigate}
            className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-[#c77e35] hover:text-[#9a5d2d] dark:text-amber-500 transition-colors"
          >
            View all {animalName} categories
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
