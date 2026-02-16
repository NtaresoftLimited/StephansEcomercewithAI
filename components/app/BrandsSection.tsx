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

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {brands.map((brand) => (
            <Link 
              key={brand._id} 
              href={`/products?q=${encodeURIComponent(brand.name)}`}
              className="group relative w-full aspect-[3/2] flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 rounded-lg p-4"
            >
              {brand.logo ? (
                <div className="relative w-full h-full">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 50vw, 16vw"
                    />
                </div>
              ) : (
                <span className="text-lg font-bold text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
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
