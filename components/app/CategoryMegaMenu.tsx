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
import { ElementType, useState } from "react";
import { ChevronDown } from "lucide-react";

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
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => {
      const isCurrentlyExpanded = prev[title];
      return {
        ...prev,
        [title]: !isCurrentlyExpanded
      };
    });
    
    // Also expand the whole mega menu to 950px when an inner group is expanded
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const featuredGroups = featuredTitles
    .map((title) => groups.find((group) => group.title === title))
    .filter((group): group is MenuGroup => Boolean(group));

  const displayGroups = isExpanded ? groups : featuredGroups;

  return (
    <div className={`flex flex-col transition-all duration-300 ${isExpanded ? 'w-[1280px] max-w-full' : 'w-[650px] max-w-full'}`}>
      <div className={`p-4 ${isExpanded ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}`}>
        {displayGroups.map((group) => {
          const Icon = CATEGORY_ICONS[group.title] || CircleDot;
          // In collapsed (featured) view, limit to 3 items
          const hasMoreItems = group.items.length > 3;
          const isGroupExpanded = expandedGroups[group.title];
          // If the group is explicitly expanded, show all. Otherwise, limit to 3.
          const displayItems = isGroupExpanded ? group.items : group.items.slice(0, 3);

          return (
            <article
              key={group.title}
              className={`flex flex-col items-center text-center bg-white dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden transition-all duration-200 hover:shadow-md relative ${isExpanded ? 'p-3' : 'p-4'}`}
            >
              <div className="w-full flex items-center justify-center relative mb-3 min-h-[24px]">
                <div className="absolute left-0 flex shrink-0 items-center justify-center text-[#5c3e2e] dark:text-amber-500">
                  {typeof Icon === 'string' ? ( 
                    <div className="h-6 w-6 bg-[#5c3e2e] dark:bg-amber-500" style={{ WebkitMaskImage: `url('${Icon}')`, maskImage: `url('${Icon}')`, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center" }} /> 
                  ) : (
                    <Icon aria-hidden="true" className="h-6 w-6" />
                  )}
                </div>
                <Link
                  href={group.href}
                  onClick={onNavigate}
                  className="text-[15px] font-bold text-zinc-900 transition-colors hover:text-[#8b4f22] dark:text-white dark:hover:text-amber-500 leading-tight px-8"
                >
                  {group.title}
                </Link>
              </div>

              <div className="flex flex-col flex-1 items-center w-full">
                <ul className="space-y-2 mb-4 w-full">
                  {displayItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className="text-[13px] text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors line-clamp-2 leading-snug"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800 w-full flex justify-center">
                  {hasMoreItems ? (
                    <button
                      onClick={() => toggleGroup(group.title)}
                      className="inline-flex items-center justify-center gap-1.5 text-[13px] font-medium text-[#5c3e2e] hover:text-[#8b4f22] dark:text-amber-500 dark:hover:text-amber-400 transition-colors"
                    >
                      {isGroupExpanded ? `Show less` : `View all`}
                      <ChevronDown aria-hidden="true" className={`h-3.5 w-3.5 transition-transform duration-200 ${isGroupExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  ) : null}
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


