"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { Frown, ArrowRight, PackageOpen } from "lucide-react";
import { sanityImageUrl } from "@/lib/sanity-image";

interface ProductTabsProps {
  product: any;
  relatedProducts?: any[];
}

export function ProductTabs({ product, relatedProducts = [] }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<
    "description" | "related" | "reviews" | "frequently"
  >("description");

  const tabs = [
    { id: "description", label: "Description" },
    { id: "related", label: "Related products" },
    { id: "reviews", label: "Reviews & Ratings" },
    { id: "frequently", label: "Frequently Bought" },
  ];

  const brandName = product.brand?.name || "Stephan's";
  const categoryTitle = product.categories?.[0]?.title || product.categories?.[0]?.name || "Pet Supplies";
  const sku = product.sku || product._id?.slice(-8).toUpperCase() || "SP-001";
  const material = product.material || "Premium Quality";
  const priceFormatted = formatPrice(product.price, "TZS");

  return (
    <div className="w-full mt-10">
      {/* Tabs Header Navigation */}
      <div className="flex items-center gap-6 md:gap-8 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "relative pb-3 text-sm font-semibold tracking-wide whitespace-nowrap transition-colors",
              activeTab === tab.id
                ? "text-zinc-900 dark:text-zinc-100 font-bold"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3e220f] dark:bg-zinc-100" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels Container - Flat, bordered, NO shadow */}
      <div className="mt-6 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 md:p-8 shadow-none min-h-[360px]">
        
        {/* 1. Description Tab */}
        {activeTab === "description" && (
          <div className="animate-in fade-in duration-200 space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                {product.name}
              </h2>
              <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Authentic <strong className="text-zinc-800 dark:text-zinc-200">{brandName}</strong> supplies directly from <strong className="text-zinc-800 dark:text-zinc-200">Stephan&apos;s Pet Store</strong>. Engineered for optimal comfort, durability, and care.
              </p>
            </div>

            {/* Specifications Section */}
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                Product Specifications:
              </h3>
              
              <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs md:text-sm border-collapse">
                  <tbody>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40">
                      <td className="w-1/3 p-3 font-semibold text-zinc-900 dark:text-zinc-100">Brand</td>
                      <td className="w-2/3 p-3 text-zinc-700 dark:text-zinc-300">{brandName}</td>
                    </tr>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <td className="w-1/3 p-3 font-semibold text-zinc-900 dark:text-zinc-100">Product Type</td>
                      <td className="w-2/3 p-3 text-zinc-700 dark:text-zinc-300 uppercase">{categoryTitle}</td>
                    </tr>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40">
                      <td className="w-1/3 p-3 font-semibold text-zinc-900 dark:text-zinc-100">Model / SKU</td>
                      <td className="w-2/3 p-3 text-zinc-700 dark:text-zinc-300 font-mono">{sku}</td>
                    </tr>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <td className="w-1/3 p-3 font-semibold text-zinc-900 dark:text-zinc-100">Material / Composition</td>
                      <td className="w-2/3 p-3 text-zinc-700 dark:text-zinc-300">{material}</td>
                    </tr>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40">
                      <td className="w-1/3 p-3 font-semibold text-zinc-900 dark:text-zinc-100">Selling Price</td>
                      <td className="w-2/3 p-3 font-semibold text-zinc-900 dark:text-zinc-100">{priceFormatted}</td>
                    </tr>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <td className="w-1/3 p-3 font-semibold text-zinc-900 dark:text-zinc-100">Supplier</td>
                      <td className="w-2/3 p-3 text-zinc-700 dark:text-zinc-300">Stephan&apos;s Pet Store Official</td>
                    </tr>
                    <tr className="bg-zinc-50/70 dark:bg-zinc-900/40">
                      <td className="w-1/3 p-3 font-semibold text-zinc-900 dark:text-zinc-100">Condition</td>
                      <td className="w-2/3 p-3 text-zinc-700 dark:text-zinc-300">Brand New - 100% Genuine</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Description Body */}
            {product.description && (
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-2">
                  Details & Description
                </h3>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Related Products Tab */}
        {activeTab === "related" && (
          <div className="animate-in fade-in duration-200">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6">
              Related products
            </h3>
            
            {relatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {relatedProducts.map((rel: any) => {
                  const relSlug = typeof rel.slug === "string" ? rel.slug : rel.slug?.current || rel._id;
                  const relImg = sanityImageUrl(rel.images?.[0]?.asset?.url, 300) || rel.images?.[0]?.asset?.url;

                  return (
                    <Link
                      key={rel._id}
                      href={`/shop/${relSlug}`}
                      className="group flex flex-col rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-3 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-none"
                    >
                      <div className="aspect-square w-full rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center p-3 overflow-hidden relative mb-2">
                        {relImg ? (
                          <Image
                            src={relImg}
                            alt={rel.name ?? "Related"}
                            fill
                            className="object-contain transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, 20vw"
                          />
                        ) : (
                          <PackageOpen className="w-8 h-8 text-zinc-300" />
                        )}
                      </div>
                      <h4 className="text-xs font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-snug min-h-[2rem]">
                        {rel.name}
                      </h4>
                      <p className="mt-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {formatPrice(rel.price, "TZS")}
                      </p>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                <Frown className="w-10 h-10 mb-2 stroke-1" />
                <p className="text-sm font-medium">No related products found!</p>
              </div>
            )}
          </div>
        )}

        {/* 3. Reviews & Ratings Tab */}
        {activeTab === "reviews" && (
          <div className="animate-in fade-in duration-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Reviews &amp; Ratings
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">0.0</span>
                  <div className="flex text-zinc-300 text-sm">★★★★★</div>
                  <span className="text-xs text-zinc-500 font-medium">Total Review 0</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => alert("Review submission form opens here")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-none"
              >
                Rate this Product <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-3">No reviews found!</p>
              <Frown className="w-12 h-12 stroke-[1.2] text-zinc-300 dark:text-zinc-600" />
            </div>
          </div>
        )}

        {/* 4. Frequently Bought Together Tab */}
        {activeTab === "frequently" && (
          <div className="animate-in fade-in duration-200 space-y-6">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Frequently Bought Together
            </h3>

            <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-3">
                No frequently bought products found!
              </p>
              <Frown className="w-12 h-12 stroke-[1.2] text-zinc-300 dark:text-zinc-600" />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
