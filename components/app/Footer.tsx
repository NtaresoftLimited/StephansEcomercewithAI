import { cn } from "@/lib/utils";
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, Truck, Award, ShieldCheck, Heart } from 'lucide-react';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <path fill="#25D366" d="M12.01 2.01c-5.52 0-9.99 4.47-9.99 9.99 0 1.77.46 3.44 1.28 4.9L2 22l5.24-1.28c1.42.78 3.05 1.22 4.77 1.22 5.52 0 9.99-4.47 9.99-9.99 0-5.52-4.47-9.99-9.99-9.99z"/>
    <path fill="#FFF" d="M17.47 14.7c-.27-.14-1.61-.8-1.86-.89-.25-.09-.43-.14-.61.14-.18.28-.7.89-.86 1.07-.15.18-.31.2-.58.06-.27-.14-1.15-.43-2.19-1.35-.81-.72-1.36-1.61-1.52-1.88-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.28.27-.47.1-.18.05-.35-.02-.48-.06-.14-.61-1.47-.83-2.02-.22-.53-.44-.46-.61-.47-.16-.01-.34-.01-.52-.01-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.29 0 1.35.98 2.65 1.12 2.84.14.18 1.93 2.95 4.68 4.14 2.75 1.19 2.75.8 3.25.75.5-.05 1.61-.66 1.84-1.3.23-.64.23-1.19.16-1.3-.06-.11-.25-.18-.52-.32z"/>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    <path fill="#FFF" d="M16.671 15.542l.532-3.469h-3.328v-2.25c0-.949.465-1.874 1.956-1.874h1.514V5.002c0 0-1.374-.235-2.686-.235-2.74 0-4.533 1.662-4.533 4.669v2.637H7.078v3.469h3.047v8.385a12.09 12.09 0 003.75 0v-8.385h2.796z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="ig-grad" x1="12" y1="24" x2="12" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#b02e5b" />
        <stop offset="0.5" stopColor="#dd2a7b" />
        <stop offset="1" stopColor="#8134af" />
      </linearGradient>
      <radialGradient id="ig-grad2" cx="0.4" cy="1" r="1.1" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#feda77" />
        <stop offset="0.5" stopColor="#f58529" />
        <stop offset="1" stopColor="transparent" />
      </radialGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
    <rect width="24" height="24" rx="6" fill="url(#ig-grad2)" />
    <path fill="#FFF" d="M12 7.03a4.97 4.97 0 100 9.94 4.97 4.97 0 000-9.94zm0 8.192a3.222 3.222 0 110-6.444 3.222 3.222 0 010 6.444zm5.02-7.59a1.18 1.18 0 11-2.36 0 1.18 1.18 0 012.36 0zM17.155 4H6.845A2.845 2.845 0 004 6.845v10.31A2.845 2.845 0 006.845 20h10.31A2.845 2.845 0 0020 17.155V6.845A2.845 2.845 0 0017.155 4zM18.25 17.155A1.095 1.095 0 0117.155 18.25H6.845A1.095 1.095 0 015.75 17.155V6.845A1.095 1.095 0 016.845 5.75h10.31A1.095 1.095 0 0118.25 6.845v10.31z"/>
  </svg>
);

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#FAF7F2] w-full pt-10 pb-10 border-t border-[#EAE3D9]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        {/* Trust Banner Section */}
        <div className="flex flex-col md:flex-row items-center justify-between pb-12 mb-12 border-b border-[#EAE3D9] gap-8 md:gap-4">
          {/* Fast Delivery */}
          <div className="flex items-center gap-4 flex-1">
            <Truck className="w-8 h-8 text-[#222222] shrink-0" strokeWidth={1.5} />
            <div>
              <h5 className="font-bold text-[13px] text-[#222222]">Fast Delivery</h5>
              <p className="text-[12px] text-zinc-600 mt-0.5">Across Tanzania</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-10 bg-[#EAE3D9] shrink-0"></div>

          {/* Top Quality */}
          <div className="flex items-center gap-4 flex-1 md:justify-center md:pl-4 w-full md:w-auto">
            <Award className="w-8 h-8 text-[#222222] shrink-0" strokeWidth={1.5} />
            <div>
              <h5 className="font-bold text-[13px] text-[#222222]">Top Quality Products</h5>
              <p className="text-[12px] text-zinc-600 mt-0.5">For every pet</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-10 bg-[#EAE3D9] shrink-0"></div>

          {/* Secure Payments */}
          <div className="flex items-center gap-4 flex-1 md:justify-center md:pl-4 w-full md:w-auto">
            <ShieldCheck className="w-8 h-8 text-[#222222] shrink-0" strokeWidth={1.5} />
            <div>
              <h5 className="font-bold text-[13px] text-[#222222]">Secure Payments</h5>
              <p className="text-[12px] text-zinc-600 mt-0.5">100% safe checkout</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-10 bg-[#EAE3D9] shrink-0"></div>

          {/* Care You Can Trust */}
          <div className="flex items-center gap-4 flex-1 md:justify-center md:pl-4 w-full md:w-auto">
            <Heart className="w-8 h-8 text-[#222222] shrink-0" strokeWidth={1.5} />
            <div>
              <h5 className="font-bold text-[13px] text-[#222222]">Care You Can Trust</h5>
              <p className="text-[12px] text-zinc-600 mt-0.5">We're pet lovers too</p>
            </div>
          </div>
        </div>

        {/* Top Section */}
        <div className="flex flex-col md:flex-row border-b border-[#EAE3D9] pb-12">
          
          {/* Column 1: Logo & Info */}
          <div className="flex-none md:w-[280px] md:pr-10 mb-12 md:mb-0">
            <Link href="/" className="inline-block mb-8">
              <Image
                src="/logo.png"
                alt="Stephan's Pet Store"
                width={160}
                height={50}
                className="h-14 w-auto object-contain mix-blend-multiply"
              />
            </Link>
            <p className="text-[#4E2A15] text-[15px] leading-[1.8] mb-10">
              Premium pet food, accessories,
              and professional grooming
              for your beloved companions.
            </p>
            
            <div className="w-full h-px bg-[#EAE3D9] mb-8"></div>
            
            <div className="flex gap-4">
              <a href="https://instagram.com/stephans_ps" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-[#F4F0EB] transition-colors">
                <InstagramIcon className="w-6 h-6" />
              </a>
              <a href="https://facebook.com/stephanspetstore" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-[#F4F0EB] transition-colors">
                <FacebookIcon className="w-6 h-6" />
              </a>
              <a href="https://wa.me/255786627873" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-[#F4F0EB] transition-colors">
                <WhatsAppIcon className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden md:block w-px bg-[#EAE3D9]"></div>

          {/* Column 2: SHOP */}
          <div className="flex-1 md:px-6 mb-10 md:mb-0">
            <h4 className="text-[#4E2A15] font-bold text-sm tracking-widest uppercase mb-3">Shop</h4>
            <div className="w-8 h-px bg-[#4E2A15] mb-8"></div>
            <div className="flex flex-col gap-6 text-[15px] text-[#4E2A15]">
              <Link href="/shop?category=dogs" className="hover:text-amber-700 transition-colors whitespace-nowrap">Dogs</Link>
              <Link href="/shop?category=cats" className="hover:text-amber-700 transition-colors whitespace-nowrap">Cats</Link>
              <Link href="/shop?category=small-pets" className="hover:text-amber-700 transition-colors whitespace-nowrap">Small Animals</Link>
              <Link href="/shop?category=pet-food" className="hover:text-amber-700 transition-colors whitespace-nowrap">Pet Food</Link>
              <Link href="/shop?category=accessories" className="hover:text-amber-700 transition-colors whitespace-nowrap">Accessories</Link>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden md:block w-px bg-[#EAE3D9]"></div>

          {/* Column 3: GROOMING */}
          <div className="flex-1 md:px-6 mb-10 md:mb-0">
            <h4 className="text-[#4E2A15] font-bold text-sm tracking-widest uppercase mb-3">Grooming</h4>
            <div className="w-8 h-px bg-[#4E2A15] mb-8"></div>
            <div className="flex flex-col gap-6 text-[15px] text-[#4E2A15]">
              <Link href="/grooming" className="hover:text-amber-700 transition-colors whitespace-nowrap">Grooming Services</Link>
              <Link href="/grooming-packages" className="hover:text-amber-700 transition-colors whitespace-nowrap">Grooming Packages</Link>
              <Link href="/grooming" className="hover:text-amber-700 transition-colors whitespace-nowrap">Book Appointment</Link>
              <Link href="/about" className="hover:text-amber-700 transition-colors whitespace-nowrap">About Grooming</Link>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden md:block w-px bg-[#EAE3D9]"></div>

          {/* Column 4: ABOUT */}
          <div className="flex-1 md:px-6 mb-10 md:mb-0">
            <h4 className="text-[#4E2A15] font-bold text-sm tracking-widest uppercase mb-3">About</h4>
            <div className="w-8 h-px bg-[#4E2A15] mb-8"></div>
            <div className="flex flex-col gap-6 text-[15px] text-[#4E2A15]">
              <Link href="/about" className="hover:text-amber-700 transition-colors whitespace-nowrap">About Us</Link>
              <Link href="/faqs" className="hover:text-amber-700 transition-colors whitespace-nowrap">FAQs</Link>
              <Link href="/delivery" className="hover:text-amber-700 transition-colors whitespace-nowrap">Delivery</Link>
              <Link href="/return-policy" className="hover:text-amber-700 transition-colors whitespace-nowrap">Returns</Link>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden md:block w-px bg-[#EAE3D9]"></div>

          {/* Column 5: CONTACT */}
          <div className="flex-[1.8] md:pl-8">
            <h4 className="text-[#4E2A15] font-bold text-sm tracking-widest uppercase mb-3">Contact</h4>
            <div className="w-8 h-px bg-[#4E2A15] mb-8"></div>
            <div className="flex flex-col gap-6 text-[15px] text-[#4E2A15]">
              <div className="flex items-center gap-4">
                <Phone className="w-[18px] h-[18px] shrink-0 text-[#6B5A4D]" />
                <a href="tel:+255786627873" className="hover:text-amber-700 transition-colors whitespace-nowrap">+255 786 627 873</a>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="w-[18px] h-[18px] shrink-0 text-[#6B5A4D]" />
                <a href="tel:+255769324445" className="hover:text-amber-700 transition-colors whitespace-nowrap">+255 769 324 445</a>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="w-[18px] h-[18px] mt-1 shrink-0 text-[#6B5A4D]" />
                <span className="leading-relaxed whitespace-nowrap">11 Slipway Rd, Masaki, Dar es Salaam</span>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="w-[18px] h-[18px] mt-1 shrink-0 text-[#6B5A4D]" />
                <span className="leading-relaxed whitespace-nowrap">58 Mikocheni A, Dar es Salaam</span>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="w-[18px] h-[18px] shrink-0 text-[#6B5A4D]" />
                <a href="mailto:info@stephanspetstore.co.tz" className="hover:text-amber-700 transition-colors">info@stephanspetstore.co.tz</a>
              </div>
              <div className="w-full h-px bg-[#EAE3D9] my-1"></div>
              <div className="flex items-start gap-4">
                <Clock className="w-[18px] h-[18px] mt-1 shrink-0 text-[#6B5A4D]" />
                <span className="leading-relaxed whitespace-nowrap">
                  Mon – Friday: 9:00 AM – 8:30 PM<br />
                  Saturday: 10:00 AM – 8:30 PM<br />
                  Sunday: Closed
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[14px] text-[#4E2A15]">
          <p>© {currentYear} Stephan's Pet Store. All rights reserved.</p>
          
          <div className="flex items-center gap-12 font-medium">
            <Link href="/return-policy" className="hover:text-amber-700 transition-colors">Return Policy</Link>
            <Link href="/terms" className="hover:text-amber-700 transition-colors">Terms & Conditions</Link>
          </div>

          <div className="flex items-center gap-6">
            <a href="https://instagram.com/stephans_ps" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">
              <InstagramIcon className="w-6 h-6" />
            </a>
            <a href="https://facebook.com/stephanspetstore" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">
              <FacebookIcon className="w-6 h-6" />
            </a>
            <a href="https://wa.me/255786627873" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">
              <WhatsAppIcon className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
