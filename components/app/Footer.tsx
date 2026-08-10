import { cn } from "@/lib/utils";
import Link from 'next/link';
import Image from "next/image";
import { Facebook, Instagram, MapPin, Phone, Mail, Clock } from 'lucide-react';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
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
          <div className="flex-1 md:px-10 mb-10 md:mb-0">
            <h4 className="text-[#4E2A15] font-bold text-sm tracking-widest uppercase mb-3">Shop</h4>
            <div className="w-8 h-px bg-[#4E2A15] mb-8"></div>
            <div className="flex flex-col gap-6 text-[15px] text-[#4E2A15]">
              <Link href="/shop?category=dogs" className="hover:text-amber-700 transition-colors">Dogs</Link>
              <Link href="/shop?category=cats" className="hover:text-amber-700 transition-colors">Cats</Link>
              <Link href="/shop?category=small-pets" className="hover:text-amber-700 transition-colors">Small Animals</Link>
              <Link href="/shop?category=pet-food" className="hover:text-amber-700 transition-colors">Pet Food</Link>
              <Link href="/shop?category=accessories" className="hover:text-amber-700 transition-colors">Accessories</Link>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden md:block w-px bg-[#EAE3D9]"></div>

          {/* Column 3: GROOMING */}
          <div className="flex-1 md:px-10 mb-10 md:mb-0">
            <h4 className="text-[#4E2A15] font-bold text-sm tracking-widest uppercase mb-3">Grooming</h4>
            <div className="w-8 h-px bg-[#4E2A15] mb-8"></div>
            <div className="flex flex-col gap-6 text-[15px] text-[#4E2A15]">
              <Link href="/grooming" className="hover:text-amber-700 transition-colors">Grooming Services</Link>
              <Link href="/grooming-packages" className="hover:text-amber-700 transition-colors">Grooming Packages</Link>
              <Link href="/grooming" className="hover:text-amber-700 transition-colors">Book Appointment</Link>
              <Link href="/about" className="hover:text-amber-700 transition-colors">About Grooming</Link>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden md:block w-px bg-[#EAE3D9]"></div>

          {/* Column 4: ABOUT */}
          <div className="flex-1 md:px-10 mb-10 md:mb-0">
            <h4 className="text-[#4E2A15] font-bold text-sm tracking-widest uppercase mb-3">About</h4>
            <div className="w-8 h-px bg-[#4E2A15] mb-8"></div>
            <div className="flex flex-col gap-6 text-[15px] text-[#4E2A15]">
              <Link href="/about" className="hover:text-amber-700 transition-colors">About Us</Link>
              <Link href="/faqs" className="hover:text-amber-700 transition-colors">FAQs</Link>
              <Link href="/delivery" className="hover:text-amber-700 transition-colors">Delivery</Link>
              <Link href="/return-policy" className="hover:text-amber-700 transition-colors">Returns</Link>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden md:block w-px bg-[#EAE3D9]"></div>

          {/* Column 5: CONTACT */}
          <div className="flex-[1.2] md:pl-10">
            <h4 className="text-[#4E2A15] font-bold text-sm tracking-widest uppercase mb-3">Contact</h4>
            <div className="w-8 h-px bg-[#4E2A15] mb-8"></div>
            <div className="flex flex-col gap-6 text-[15px] text-[#4E2A15]">
              <div className="flex items-center gap-4">
                <Phone className="w-[18px] h-[18px] shrink-0 text-[#6B5A4D]" />
                <a href="tel:+255786627873" className="hover:text-amber-700 transition-colors">+255 786 627 873</a>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="w-[18px] h-[18px] shrink-0 text-[#6B5A4D]" />
                <a href="tel:+255769324445" className="hover:text-amber-700 transition-colors">+255 769 324 445</a>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="w-[18px] h-[18px] mt-1 shrink-0 text-[#6B5A4D]" />
                <span className="leading-relaxed">11 Slipway Rd, Masaki<br />58 Mikocheni A,<br />Dar es Salaam</span>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="w-[18px] h-[18px] shrink-0 text-[#6B5A4D]" />
                <a href="mailto:info@stephanspetstore.co.tz" className="hover:text-amber-700 transition-colors">info@stephanspetstore.co.tz</a>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="w-[18px] h-[18px] mt-1 shrink-0 text-[#6B5A4D]" />
                <span className="leading-relaxed">Mon – Friday: 9:00 AM – 8:30 PM<br />Saturday: 10:00 AM – 8:30 PM<br />Sunday: Closed</span>
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
