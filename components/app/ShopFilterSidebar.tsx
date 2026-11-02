"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { 
  LayoutGrid, 
  Dog, 
  Cat, 
  Bird, 
  Scissors, 
  Sparkles, 
  ChevronRight, 
  Fish, 
  Heart,
  Bone
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShopFilterSidebarProps {
  categories?: any[];
  activeCategorySlug?: string;
}

export function ShopFilterSidebar({ 
  categories = [], 
  activeCategorySlug = "" 
}: ShopFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Primary predefined pet store categories matching standard navigation
  const primaryCategories = [
    {
      id: "all",
      title: "All Category",
      slug: "",
      href: "/shop",
      icon: LayoutGrid,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50",
    },
    {
      id: "dogs",
      title: "Dogs",
      slug: "dogs",
      href: "/shop/dogs",
      icon: Dog,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50",
    },
    {
      id: "cats",
      title: "Cats",
      slug: "cats",
      href: "/shop/cats",
      icon: Cat,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      id: "birds",
      title: "Birds",
      slug: "birds",
      href: "/shop/birds",
      icon: Bird,
      color: "text-sky-600 bg-sky-50 dark:bg-sky-950/50",
    },
    {
      id: "small-pets",
      title: "Small Pets",
      slug: "small-pets",
      href: "/shop/small-pets",
      icon: Bone,
      color: "text-orange-600 bg-orange-50 dark:bg-orange-950/50",
    },
    {
      id: "grooming",
      title: "Grooming & Spa",
      slug: "grooming",
      href: "/grooming",
      icon: Scissors,
      color: "text-rose-600 bg-rose-50 dark:bg-rose-950/50",
    },
    {
      id: "fresh-food",
      title: "Pet Food & Diet",
      slug: "food",
      href: "/shop/food",
      icon: Sparkles,
      color: "text-teal-600 bg-teal-50 dark:bg-teal-950/50",
    },
  ];

  return (
    <aside className="w-full">
      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-none">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 px-3 py-2">
          Categories
        </h2>

        <nav className="mt-2 space-y-1" aria-label="Product Categories">
          {primaryCategories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategorySlug
              ? activeCategorySlug.toLowerCase() === cat.slug.toLowerCase()
              : cat.slug === "";

            return (
              <Link
                key={cat.id}
                href={cat.href}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isSelected
                    ? "bg-[#F3E8FF] text-[#7E22CE] dark:bg-purple-950/50 dark:text-purple-300 font-semibold"
                    : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
                      isSelected
                        ? "bg-[#7E22CE] text-white"
                        : cat.color
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="truncate">{cat.title}</span>
                </div>

                <ChevronRight
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform",
                    isSelected
                      ? "text-[#7E22CE] dark:text-purple-300 font-bold"
                      : "text-zinc-400 group-hover:translate-x-0.5"
                  )}
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
