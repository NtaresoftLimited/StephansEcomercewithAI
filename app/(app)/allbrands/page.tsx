import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "All Brands - Stephan's Pet Store",
  description: "Exceptional brands thoughtfully selected for your beloved pets.",
};

const BRANDS = [
  {
    name: "Bioline",
    logo: "/brands/Bioline.webp",
    slug: "bioline",
  },
  {
    name: "Summit 10",
    logo: "/brands/Summit-10.svg",
    slug: "summit10",
  },
  {
    name: "TropiCat",
    logo: "/brands/TropiCat_logo.svg",
    slug: "tropicat",
  },
  {
    name: "TropiDog",
    logo: "/brands/TropiDog_logo.svg",
    slug: "tropidog",
  },
];

export default function AllBrandsPage() {
  return (
    <main className="min-h-screen bg-[#F9F7F5] py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header Section */}
        <div className="text-center mb-16 md:mb-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#222] mb-6 tracking-tight">
            Trusted Brands
          </h1>
          <div className="w-12 h-[1px] bg-[#c77e35] mx-auto mb-6"></div>
          <p className="text-base md:text-lg text-[#555] font-serif">
            Exceptional brands. Thoughtfully selected.
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {BRANDS.map((brand) => (
            <Link 
              key={brand.slug}
              href={`/brands/${brand.slug}`}
              className="bg-white rounded-[32px] p-8 h-[340px] md:h-[420px] flex flex-col justify-between items-center border border-[#EAE3D9]/60 shadow-none transition-all duration-500 hover:shadow-sm hover:-translate-y-1 group"
            >
              {/* Logo Area (centered) */}
              <div className="flex-grow flex items-center justify-center w-full">
                <div className="relative w-full max-w-[200px] h-24">
                  <Image 
                    src={brand.logo} 
                    alt={brand.name} 
                    fill 
                    className={`object-contain transition-transform duration-500 group-hover:scale-105 ${brand.name === 'Bioline' ? 'mix-blend-multiply' : ''}`}
                  />
                </div>
              </div>
              
              {/* Explore Link */}
              <div className="flex items-center gap-3 text-[13px] font-bold text-[#222] transition-colors group-hover:text-[#c77e35] tracking-wide">
                <span className="border-b-[2px] border-[#EAE3D9] group-hover:border-[#c77e35] pb-0.5 transition-colors">
                  Explore
                </span>
                <ArrowRight className="w-4 h-4 text-[#888] group-hover:text-[#c77e35] transition-colors -ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
