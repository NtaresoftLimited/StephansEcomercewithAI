import { cn } from "@/lib/utils";
import Link from 'next/link';
import Image from "next/image";
import { Facebook, Instagram, MapPin, Phone, Mail, Clock } from 'lucide-react';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <path fill="#25D366" d="M12.01 2.01c-5.52 0-9.99 4.47-9.99 9.99 0 1.77.46 3.44 1.28 4.9L2 22l5.24-1.28c1.42.78 3.05 1.22 4.77 1.22 5.52 0 9.99-4.47 9.99-9.99 0-5.52-4.47-9.99-9.99-9.99z"/>
    <path fill="#FFF" d="M17.47 14.7c-.27-.14-1.61-.8-1.86-.89-.25-.09-.43-.14-.61.14-.18.28-.7.89-.86 1.07-.15.18-.31.2-.58.06-.27-.14-1.15-.43-2.19-1.35-.81-.72-1.36-1.61-1.52-1.88-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.28.27-.47.1-.18.05-.35-.02-.48-.06-.14-.61-1.47-.83-2.02-.22-.53-.44-.46-.61-.47-.16-.01-.34-.01-.52-.01-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.29 0 1.35.98 2.65 1.12 2.84.14.18 1.93 2.95 4.68 4.14 2.75 1.19 2.75.8 3.25.75.5-.05 1.61-.66 1.84-1.3.23-.64.23-1.19.16-1.3-.06-.11-.25-.18-.52-.32z"/>
  </svg>
);

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#FAF7F2] w-full pt-20 pb-10 border-t border-[#EAE3D9]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
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
              <a href="https://instagram.com/stephans_ps" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full border border-[#D5C6B6] flex items-center justify-center text-[#4E2A15] hover:bg-[#D5C6B6] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com/stephanspetstore" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full border border-[#D5C6B6] flex items-center justify-center text-[#4E2A15] hover:bg-[#D5C6B6] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://wa.me/255786627873" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full border border-[#D5C6B6] flex items-center justify-center text-[#4E2A15] hover:bg-[#D5C6B6] transition-colors">
                <WhatsAppIcon className="w-5 h-5" />
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

          <div className="flex items-center gap-6 text-[#4E2A15]">
            <a href="https://instagram.com/stephans_ps" target="_blank" rel="noreferrer" className="hover:text-amber-700 transition-colors">
              <Instagram className="w-[22px] h-[22px]" />
            </a>
            <a href="https://facebook.com/stephanspetstore" target="_blank" rel="noreferrer" className="hover:text-amber-700 transition-colors">
              <Facebook className="w-[22px] h-[22px]" />
            </a>
            <a href="https://wa.me/255786627873" target="_blank" rel="noreferrer" className="hover:text-amber-700 transition-colors">
              <WhatsAppIcon className="w-[22px] h-[22px]" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
