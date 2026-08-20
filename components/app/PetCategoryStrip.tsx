import Image from "next/image";
import Link from "next/link";

const petCategories = [
  {
    name: "Dogs",
    href: "/shop?category=dogs",
    icon: "/icons/minimalist-dog.png",
    imageClassName: "scale-[1.2]",
  },
  {
    name: "Cats",
    href: "/shop?category=cats",
    icon: "/icons/minimalist-cat.png",
    imageClassName: "scale-[1.2]",
  },
  {
    name: "Small Animals",
    href: "/shop?category=small-pets",
    icon: "/icons/minimalist-rabbit.png",
    imageClassName: "scale-[1.4]",
  },
  {
    name: "Birds",
    href: "/shop?category=birds",
    icon: "/icons/minimalist-bird.png",
    imageClassName: "scale-[1.5]",
  },
] as const;

export function PetCategoryStrip() {
  return (
    <section aria-label="Shop by pet" className="bg-[#fbf8f5]">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 border-y border-[#e8e0d9] lg:grid-cols-4">
          {petCategories.map((category, index) => (
            <Link
              key={category.name}
              href={category.href}
              className={`group flex min-h-40 flex-col items-center justify-center px-3 py-6 text-center transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5e3c] focus-visible:ring-inset sm:min-h-44 sm:px-6 ${
                index % 2 === 0 ? "border-r border-[#e8e0d9]" : ""
              } ${index >= 2 ? "border-t border-[#e8e0d9] lg:border-t-0" : ""} ${
                index === 1 ? "lg:border-r lg:border-[#e8e0d9]" : ""
              } ${index === 2 ? "lg:border-r lg:border-[#e8e0d9]" : ""}`}
            >
              <span className="relative mb-3 block h-14 w-14 sm:h-16 sm:w-16">
                <Image
                  src={category.icon}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 56px, 64px"
                  className={`object-contain transition-transform duration-300 group-hover:-translate-y-1 mix-blend-multiply ${category.imageClassName}`}
                />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#28231f] sm:text-xs">
                {category.name}
              </span>
              <span className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#5d554f] sm:text-sm">
                Explore
                <span
                  aria-hidden="true"
                  className="text-base leading-none transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
