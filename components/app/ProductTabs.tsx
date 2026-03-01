"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductTabsProps {
    product: any;
}

export function ProductTabs({ product }: ProductTabsProps) {
    const [activeTab, setActiveTab] = useState<"description" | "details" | "reviews">("description");

    const tabs = [
        { id: "description", label: "Description" },
        { id: "details", label: "Specifications" },
        { id: "reviews", label: "Reviews (128)" },
    ];

    return (
        <div className="w-full mt-8 md:mt-16">
            {/* Sticky Tab Header */}
            <div className="flex items-center gap-8 border-b border-zinc-200 dark:border-zinc-800 sticky top-[60px] md:top-[80px] bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-md z-30 pt-4 px-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "relative pb-4 text-sm font-bold uppercase tracking-widest transition-colors",
                            activeTab === tab.id
                                ? "text-zinc-900 dark:text-zinc-50"
                                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                        )}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-900 dark:bg-zinc-50" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="py-8 min-h-[300px]">
                {activeTab === "description" && (
                    <div className="prose prose-sm md:prose-base prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400 leading-relaxed animate-in fade-in slide-in-from-bottom-2">
                        {product.description ? (
                            <p>{product.description}</p>
                        ) : (
                            <p className="italic text-zinc-400">No description available for this product.</p>
                        )}
                    </div>
                )}

                {activeTab === "details" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                        <h3 className="text-sm font-bold uppercase tracking-wide mb-6 text-zinc-900 dark:text-zinc-100">Product Details</h3>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
                                <dt className="font-medium text-zinc-900 dark:text-zinc-100 text-xs uppercase mb-1">Brand</dt>
                                <dd className="text-sm text-zinc-500 dark:text-zinc-400">{product.brand?.name || "Generic"}</dd>
                            </div>
                            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
                                <dt className="font-medium text-zinc-900 dark:text-zinc-100 text-xs uppercase mb-1">Category</dt>
                                <dd className="text-sm text-zinc-500 dark:text-zinc-400">{product.category?.title || "N/A"}</dd>
                            </div>
                            {product.material && (
                                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
                                    <dt className="font-medium text-zinc-900 dark:text-zinc-100 text-xs uppercase mb-1">Ingredients / Material</dt>
                                    <dd className="text-sm text-zinc-500 dark:text-zinc-400 capitalize">{product.material}</dd>
                                </div>
                            )}
                            {product.dimensions && (
                                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
                                    <dt className="font-medium text-zinc-900 dark:text-zinc-100 text-xs uppercase mb-1">Dimensions</dt>
                                    <dd className="text-sm text-zinc-500 dark:text-zinc-400">{product.dimensions}</dd>
                                </div>
                            )}
                        </dl>
                    </div>
                )}

                {activeTab === "reviews" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-4 mb-8 bg-zinc-100 dark:bg-zinc-800/50 p-6 rounded-lg">
                            <div className="text-5xl font-bold text-zinc-900 dark:text-zinc-50">4.8</div>
                            <div>
                                <div className="flex text-[#D35122] mb-1">
                                    {"★".repeat(5)}
                                </div>
                                <div className="text-sm text-zinc-500">Based on 128 Reviews</div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            {/* Mock Reviews List */}
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="border-b border-zinc-100 dark:border-zinc-800 pb-6 last:border-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-zinc-900 dark:text-zinc-100">Verified Buyer {i + 1}</span>
                                        <span className="text-xs text-zinc-400">2 weeks ago</span>
                                    </div>
                                    <div className="flex text-[#D35122] mb-2 text-sm">
                                        {"★".repeat(5)}
                                    </div>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        Absolutely love this product! My pet enjoys it every day and I've noticed a great improvement. Highly recommend it to anyone.
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
