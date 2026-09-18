import Link from "next/link";
import Image from "next/image";

export const CategoryNavigationSection = () => {
  return (
    <section className="bg-white">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#222222] leading-tight">
            Everything they need,<br />
            chosen with care.
          </h2>
        </div>

        <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-6 md:px-8">
          
          {/* FOOD */}
          <Link href="/shop/food" className="flex flex-col items-center gap-1 group opacity-80 hover:opacity-100 transition-opacity px-2 sm:px-6 shrink-0 min-w-[130px]">
            <div className="w-12 h-12 bg-[#c77e35] mb-4 mx-auto" style={{ WebkitMaskImage: 'url(/categories/Food_Stephans.png)', maskImage: 'url(/categories/Food_Stephans.png)', WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }}></div>
            <span className="text-[11px] font-bold tracking-widest text-[#222] uppercase">Food</span>
            <span className="text-[13px] text-zinc-500 group-hover:text-[#4E2A15] transition-colors mt-2 flex items-center gap-1">Shop now <span className="font-serif font-light text-lg relative top-[-1px]">&rarr;</span></span>
          </Link>
          
          <div className="w-[1px] h-20 bg-[#EAE3D9] shrink-0 hidden sm:block"></div>

          {/* TREATS */}
          <Link href="/shop/treats" className="flex flex-col items-center gap-1 group opacity-80 hover:opacity-100 transition-opacity px-2 sm:px-6 shrink-0 min-w-[130px]">
            <div className="w-12 h-12 bg-[#c77e35] mb-4 mx-auto" style={{ WebkitMaskImage: 'url(/categories/Treats_Stephans.png)', maskImage: 'url(/categories/Treats_Stephans.png)', WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }}></div>
            <span className="text-[11px] font-bold tracking-widest text-[#222] uppercase">Treats</span>
            <span className="text-[13px] text-zinc-500 group-hover:text-[#4E2A15] transition-colors mt-2 flex items-center gap-1">Shop now <span className="font-serif font-light text-lg relative top-[-1px]">&rarr;</span></span>
          </Link>
          
          <div className="w-[1px] h-20 bg-[#EAE3D9] shrink-0 hidden sm:block"></div>

          {/* TOYS */}
          <Link href="/shop/toys" className="flex flex-col items-center gap-1 group opacity-80 hover:opacity-100 transition-opacity px-2 sm:px-6 shrink-0 min-w-[130px]">
            <div className="w-12 h-12 bg-[#c77e35] mb-4 mx-auto" style={{ WebkitMaskImage: 'url(/categories/Toys_Stephans.png)', maskImage: 'url(/categories/Toys_Stephans.png)', WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }}></div>
            <span className="text-[11px] font-bold tracking-widest text-[#222] uppercase">Toys</span>
            <span className="text-[13px] text-zinc-500 group-hover:text-[#4E2A15] transition-colors mt-2 flex items-center gap-1">Shop now <span className="font-serif font-light text-lg relative top-[-1px]">&rarr;</span></span>
          </Link>
          
          <div className="w-[1px] h-20 bg-[#EAE3D9] shrink-0 hidden sm:block"></div>

          {/* ACCESSORIES */}
          <Link href="/shop/accessories" className="flex flex-col items-center gap-1 group opacity-80 hover:opacity-100 transition-opacity px-2 sm:px-6 shrink-0 min-w-[130px]">
            <div className="w-12 h-12 bg-[#c77e35] mb-4 mx-auto" style={{ WebkitMaskImage: 'url(/categories/Accessories_Stephans.png)', maskImage: 'url(/categories/Accessories_Stephans.png)', WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }}></div>
            <span className="text-[11px] font-bold tracking-widest text-[#222] uppercase">Accessories</span>
            <span className="text-[13px] text-zinc-500 group-hover:text-[#4E2A15] transition-colors mt-2 flex items-center gap-1">Shop now <span className="font-serif font-light text-lg relative top-[-1px]">&rarr;</span></span>
          </Link>
          
          <div className="w-[1px] h-20 bg-[#EAE3D9] shrink-0 hidden sm:block"></div>

          {/* GROOMING */}
          <Link href="/grooming" className="flex flex-col items-center gap-1 group opacity-80 hover:opacity-100 transition-opacity px-2 sm:px-6 shrink-0 min-w-[130px]">
            <div className="w-12 h-12 bg-[#c77e35] mb-4 mx-auto" style={{ WebkitMaskImage: 'url(/categories/Grooming_Scissors.png)', maskImage: 'url(/categories/Grooming_Scissors.png)', WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }}></div>
            <span className="text-[11px] font-bold tracking-widest text-[#222] uppercase">Grooming</span>
            <span className="text-[13px] text-zinc-500 group-hover:text-[#4E2A15] transition-colors mt-2 flex items-center gap-1">Book now <span className="font-serif font-light text-lg relative top-[-1px]">&rarr;</span></span>
          </Link>

        </div>
      </div>
    </section>
  );
};
