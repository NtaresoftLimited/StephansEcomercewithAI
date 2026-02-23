import Link from "next/link";
import Image from "next/image";

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

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {brands.map((brand) => (
            <Link
              key={brand._id}
              href={`/brands/${brand.slug}`}
              className="group relative aspect-[3/2] flex items-center justify-center bg-white dark:bg-zinc-900/50 rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-zinc-100 dark:border-zinc-800"
            >
              {brand.logo ? (
                <div className="relative w-full h-full transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    unoptimized
                    className="object-contain"
                    sizes="(max-width: 768px) 40vw, 15vw"
                    priority
                  />
                </div>
              ) : (
                <span className="text-xl font-bold text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors uppercase tracking-widest text-center px-4">
                  {brand.name}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
