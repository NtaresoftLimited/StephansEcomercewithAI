"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dog, Cat, Bird, Fish, Bone, Heart, Sparkles } from "lucide-react";

interface Category {
    slug: string;
    title: string;
    icon: React.ReactNode;
}

const QUICK_CATEGORIES: Category[] = [
    { slug: "", title: "All", icon: <Sparkles className="h-4 w-4" /> },
    { slug: "dogs", title: "Dogs", icon: <Dog className="h-4 w-4" /> },
    { slug: "cats", title: "Cats", icon: <Cat className="h-4 w-4" /> },
    { slug: "birds", title: "Birds", icon: <Bird className="h-4 w-4" /> },
    { slug: "fish", title: "Fish", icon: <Fish className="h-4 w-4" /> },
    { slug: "food", title: "Food", icon: <Bone className="h-4 w-4" /> },
    { slug: "accessories", title: "Accessories", icon: <Heart className="h-4 w-4" /> },
];

function CategoryTabsInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeCategory = searchParams.get("category") || "";

    const handleCategoryClick = (slug: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slug) {
            params.set("category", slug);
        } else {
            params.delete("category");
        }
        router.push(`/?${params.toString()}`);
    };

    return (
        <div className="mb-6 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 pb-2">
                {QUICK_CATEGORIES.map((category) => (
                    <button
                        key={category.slug}
                        onClick={() => handleCategoryClick(category.slug)}
                        className={`
              flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all
              ${activeCategory === category.slug
                                ? "bg-[#6b3e1e] text-white shadow-md"
                                : "bg-white text-zinc-700 hover:bg-[#6b3e1e]/10 border border-zinc-200"
                            }
            `}
                    >
                        {category.icon}
                        {category.title}
                    </button>
                ))}
            </div>
        </div>
    );
}

export function CategoryTabs() {
    return (
        <Suspense fallback={null}>
            <CategoryTabsInner />
        </Suspense>
    );
}
