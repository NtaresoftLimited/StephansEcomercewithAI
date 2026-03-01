"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck } from "lucide-react";

interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
}

interface BrandsSectionProps {
  brands: Brand[];
}

// Curated gradient palette for brand banners
const BANNER_GRADIENTS = [
  "from-amber-100 via-orange-50 to-yellow-50 dark:from-amber-900/40 dark:via-orange-900/30 dark:to-yellow-900/20",
  "from-sky-100 via-cyan-50 to-blue-50 dark:from-sky-900/40 dark:via-cyan-900/30 dark:to-blue-900/20",
  "from-emerald-100 via-green-50 to-teal-50 dark:from-emerald-900/40 dark:via-green-900/30 dark:to-teal-900/20",
  "from-purple-100 via-violet-50 to-fuchsia-50 dark:from-purple-900/40 dark:via-violet-900/30 dark:to-fuchsia-900/20",
  "from-rose-100 via-pink-50 to-red-50 dark:from-rose-900/40 dark:via-pink-900/30 dark:to-red-900/20",
  "from-slate-100 via-zinc-50 to-gray-50 dark:from-slate-900/40 dark:via-zinc-900/30 dark:to-gray-900/20",
];

// Banner images for specific brands
const BRAND_BANNERS: Record<string, string[]> = {
  summit10: [
    "/Banners/Summit Banner.jpg.jpeg",
    "/Banners/Summit Banner 1.jpg.jpeg",
    "/Banners/Summit Banner 2.jpg.jpeg",
  ],
};

export function BrandsSection({ brands }: BrandsSectionProps) {
  if (!brands || brands.length === 0) return null;

  return (
    <section className="py-24 bg-zinc-50 dark:bg-black border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground uppercase">
            Our Brands
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Top quality brands for your beloved pets
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {brands.map((brand, index) => (
            <Link
              key={brand.slug}
              href={`/brands/${brand.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Banner Gradient Background */}
              <div className={`relative h-28 md:h-32 w-full bg-gradient-to-br ${BANNER_GRADIENTS[index % BANNER_GRADIENTS.length]} overflow-hidden`}>
                {BRAND_BANNERS[brand.slug] && (
                  <>
                    <div
                      className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-50"
                      style={{
                        animation: `brandRotation-${brand.slug} 60s linear infinite`,
                      }}
                    />
                    <style>{`
                      @keyframes brandRotation-${brand.slug} {
                        ${BRAND_BANNERS[brand.slug]
                        .map((img, i) => {
                          const step = 100 / BRAND_BANNERS[brand.slug].length;
                          const start = i * step;
                          const end = (i + 1) * step;
                          return `
                            ${start.toFixed(2)}%, ${(end - 0.01).toFixed(2)}% {
                              background-image: url('${img}');
                            }`;
                        })
                        .join("")}
                      }
                    `}</style>
                  </>
                )}
                {/* Decorative circles */}
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/20 dark:bg-white/5" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/15 dark:bg-white/5" />

                {/* Verified Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full shadow-sm">
                  <BadgeCheck className="w-3 h-3" />
                  Verified
                </div>
              </div>

              {/* Circular Floating Logo */}
              <div className="relative -mt-12 flex justify-center z-10">
                <div className="w-24 h-24 rounded-full bg-white dark:bg-zinc-900 border-4 border-white dark:border-zinc-800 shadow-md flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110">
                  {brand.logo ? (
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      width={80}
                      height={80}
                      unoptimized
                      className="object-contain w-16 h-16"
                    />
                  ) : (
                    <span className="text-lg font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-center leading-tight px-1">
                      {brand.name.substring(0, 2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Brand Info */}
              <div className="flex flex-col items-center gap-2 px-4 pt-3 pb-5 text-center">
                <h3 className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                  {brand.name}
                </h3>

                {/* Hover CTA */}
                <span className="flex items-center gap-1 text-xs font-semibold text-[#D35122] opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-1 group-hover:translate-y-0">
                  View Products
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
