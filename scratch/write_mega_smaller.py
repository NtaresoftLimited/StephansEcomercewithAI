import os

content = """"use client";

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
import { ElementType, useState } from "react";

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
  "Food": "/icons/pet-bowl.png",
  "Bird Foods": "/icons/pet-bowl.png",
  "Tick, Flea & Deworming": "/icons/shield-tick.png",
  "Wellness & Supplements": HeartPulse,
  "Treats & Chews": "/icons/Treats_Stephans.png",
  "Treats": "/icons/Treats_Stephans.png",
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
  "Toys": Dumbbell,
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
  const [isExpanded, setIsExpanded] = useState(false);

  const featuredGroups = featuredTitles
    .map((title) => groups.find((group) => group.title === title))
    .filter((group): group is MenuGroup => Boolean(group));

  const displayGroups = isExpanded ? groups : featuredGroups;

  return (
    <div className="w-full flex flex-col">
      <div className={`p-4 ${isExpanded ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}`}>
        {displayGroups.map((group) => {
          const Icon = CATEGORY_ICONS[group.title] || CircleDot;
          // In collapsed (featured) view, limit to 3 items
          const displayItems = isExpanded ? group.items : group.items.slice(0, 3);

          return (
            <article
              key={group.title}
              className={`flex flex-col bg-white dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden transition-all duration-200 hover:shadow-md ${isExpanded ? 'p-3' : 'p-4'}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="flex shrink-0 items-center justify-center text-[#5c3e2e] dark:text-amber-500">
                  {typeof Icon === 'string' ? ( 
                    <div className="h-6 w-6 bg-[#5c3e2e] dark:bg-amber-500" style={{ WebkitMaskImage: `url('${Icon}')`, maskImage: `url('${Icon}')`, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center" }} /> 
                  ) : ( 
                    <Icon aria-hidden="true" className="h-6 w-6 stroke-[1.5]" /> 
                  )}
                </div>
                <Link
                  href={group.href}
                  onClick={onNavigate}
                  className="text-[15px] font-bold text-zinc-900 transition-colors hover:text-[#8b4f22] dark:text-white dark:hover:text-amber-500 leading-tight pt-0.5"
                >
                  {group.title}
                </Link>
              </div>

              <div className="flex flex-col flex-1 pl-9">
                <ul className="space-y-2 mb-4">
                  {displayItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className="inline-block text-[13px] text-zinc-600 transition-colors hover:text-[#8b4f22] dark:text-zinc-400 dark:hover:text-amber-500 w-full"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <Link
                    href={group.href}
                    onClick={onNavigate}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#5c3e2e] transition-colors hover:text-[#8b4f22] dark:text-amber-500"
                  >
                    View all {group.title}
                    <ArrowRight aria-hidden="true" className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="bg-[#fcfaf8] dark:bg-zinc-900/50 p-3 border-t border-[#f0ebe1] dark:border-zinc-800 flex justify-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5c3e2e] px-5 py-2 text-[12px] font-medium text-white transition-colors hover:bg-[#4a3224]"
        >
          {isExpanded ? `View featured ${animalName} categories` : `View all ${animalName} categories`}
          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
"""
with open("components/app/CategoryMegaMenu.tsx", "w", encoding="utf-8") as f:
    f.write(content)
