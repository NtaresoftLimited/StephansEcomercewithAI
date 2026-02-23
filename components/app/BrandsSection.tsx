import Link from "next/link";
import Image from "next/image";

interface Brand {
  _id?: string;
  id?: number;
  name: string;
  slug?: string;
  logo?: string;
  description?: string;
}

interface BrandsSectionProps {
  brands: any[]; // Using any[] to accept both Sanity and Odoo data structures for now
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
          {brands.map((brand) => {
             // Handle Odoo vs Sanity data differences
             const key = brand._id || brand.id;
             // Generate slug if missing (Odoo brands might not have slug field)
             const slug = brand.slug?.current || brand.slug || brand.name.toLowerCase().replace(/\s+/g, '-');
             // Handle Logo: Odoo sends base64, Sanity sends URL
             let logoSrc = brand.logo;
             if (brand.logo && !brand.logo.startsWith('http') && !brand.logo.startsWith('data:')) {
                 // Assume Odoo base64 without prefix
                 logoSrc = `data:image/png;base64,${brand.logo}`;
             }

             return (
            <Link
              key={key}
              href={`/brands/${slug}`}
              className="group relative aspect-[3/2] flex items-center justify-center bg-white dark:bg-zinc-900/50 rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-zinc-100 dark:border-zinc-800"
            >
              {logoSrc ? (
                <div className="relative w-full h-full">
                  <Image
                    src={logoSrc}
                    alt={brand.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 40vw, 15vw"
                  />
                </div>
              ) : (
                <span className="text-lg font-bold text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                  {brand.name}
                </span>
              )}
            </Link>
          );
        })}
        </div>
      </div>
    </section>
  );
}
