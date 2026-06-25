"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { 
  ChevronDown, Sparkles, Percent, Dog, Cat, Bird, MousePointer2,
  Utensils, ShieldCheck, HeartPulse, Bone, Scissors, Trash2, Refrigerator,
  Bed, Home, Dumbbell, Shield, Shirt, Brain, Car, Baby, CircleDot,
  Wind, User, Heart, LogIn, LogOut
} from "lucide-react";
import { DEEP_NAV_MENU } from "@/lib/config/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

interface MobileNavMenuProps {
  onClose: () => void;
}

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, any> = {
  "Dog Food": Utensils,
  "Cat Food": Utensils,
  "Bird Food": Utensils,
  "Food": Utensils,
  "Tick, Flea & Deworming": ShieldCheck,
  "Wellness & Supplements": HeartPulse,
  "Treats & Chews": Bone,
  "Treats & Supplements": Bone,
  "Oral Care": Sparkles,
  "Grooming Essentials": Scissors,
  "Hygiene & Care": Scissors,
  "Clean Living": Trash2,
  "Litter & Clean Living": Trash2,
  "Bowls & Feeders": Refrigerator,
  "Beds & Blankets": Bed,
  "Home & Crates": Home,
  "Homes & Nests": Home,
  "Little Homes": Home,
  "Scratchers & Housing": Home,
  "Toys & Plays": Dumbbell,
  "Toys & Enrichment": Dumbbell,
  "Collars, Harnesses & Leads": Shield,
  "Collars & Harnesses": Shield,
  "Perches & Accessories": Wind,
  "Pet Apparel": Shirt,
  "Training & Behavior": Brain,
  "Travel Essentials": Car,
  "Kitten Essentials": Baby,
  "Puppy Essentials": Baby,
};

export function MobileNavMenu({ onClose }: MobileNavMenuProps) {
  const { data: session, status } = useSession();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const sections = [
    { id: "dogs", title: "Shop For Dog", icon: "/icons/icon-dog.png", data: DEEP_NAV_MENU.dogs, href: "/shop?category=dogs" },
    { id: "cats", title: "Shop For Cat", icon: "/icons/icon-cat.png", data: DEEP_NAV_MENU.cats, href: "/shop?category=cats" },
    { id: "birds", title: "Shop For Birds", icon: Bird, data: DEEP_NAV_MENU.birds, href: "/shop?category=birds" },
    { id: "smallPets", title: "Small Pets", icon: MousePointer2, data: DEEP_NAV_MENU.smallPets, href: "/shop?category=small-pets" },
  ];

  return (
    <nav className="flex flex-col gap-4">
      {/* Deep Nested Categories */}
      {sections.map((section) => (
        <Collapsible
          key={section.id}
          open={openSection === section.id}
          onOpenChange={() => toggleSection(section.id)}
          className="border-b border-zinc-100 dark:border-zinc-800 pb-2"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between text-lg font-medium text-zinc-700 dark:text-zinc-200 hover:text-amber-600 transition-colors">
            <div className="flex items-center gap-3">
              {typeof section.icon === "string" ? (
                <Image
                  src={section.icon}
                  alt={section.title}
                  width={20}
                  height={20}
                  className={cn(
                    "w-5 h-5 object-contain",
                    openSection === section.id ? "brightness-90" : "opacity-80"
                  )}
                />
              ) : (
                <section.icon className={openSection === section.id ? "text-amber-600" : "text-zinc-400"} size={20} />
              )}
              {section.title}
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${
                openSection === section.id ? "rotate-180 text-amber-600" : "text-zinc-400"
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-6 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
            {section.data.map((group) => {
              const SubIcon = CATEGORY_ICONS[group.title] || CircleDot;
              return (
                <div key={group.title} className="pl-2">
                  <Link
                    href={group.href}
                    onClick={onClose}
                    className="flex items-center gap-3 group/sub"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
                      <SubIcon size={16} className="text-zinc-400 group-hover/sub:text-amber-600 transition-colors" />
                    </div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-100 hover:text-amber-600 transition-colors">
                      {group.title}
                    </span>
                  </Link>
                  <div className="flex flex-col gap-3 mt-3 pl-11">
                    {group.items.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={onClose}
                        className="text-sm text-zinc-500 hover:text-amber-600 transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      ))}

      {/* Primary Links */}
      <Link
        href="/grooming"
        onClick={onClose}
        className="text-lg font-medium text-blue-600 dark:text-blue-400 mt-2 hover:text-blue-700 transition-colors flex items-center gap-3"
      >
        <div className="w-5 h-5 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        </div>
        Grooming Salon
      </Link>
      
      <Link
        href="/products?sort=new"
        onClick={onClose}
        className="text-lg font-medium text-pink-600 dark:text-pink-400 hover:text-pink-700 transition-colors flex items-center gap-3"
      >
        <Sparkles size={20} className="text-pink-500" />
        New Arrivals
      </Link>

      <Link
        href="/shop/offers"
        onClick={onClose}
        className="text-lg font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 transition-colors flex items-center gap-3"
      >
        <Percent size={20} className="text-orange-500" />
        Offers & Deals
      </Link>

      <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2" />

      <Link
        href="/stores"
        onClick={onClose}
        className="text-lg font-medium text-zinc-700 dark:text-zinc-200 hover:text-amber-600 transition-colors"
      >
        Locations
      </Link>
      
      <Link
        href="/about"
        onClick={onClose}
        className="text-lg font-medium text-zinc-700 dark:text-zinc-200 hover:text-amber-600 transition-colors"
      >
        About Us
      </Link>
      
      <Link
        href="/contact"
        onClick={onClose}
        className="text-lg font-medium text-zinc-700 dark:text-zinc-200 hover:text-amber-600 transition-colors pb-2"
      >
        Contact
      </Link>

      {status === "authenticated" && (
        <>
          <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2" />
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800/80 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center overflow-hidden">
                <Image
                  src="/icons/icon-profile-user.png"
                  alt="User Profile"
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Logged In As</span>
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate max-w-[180px]">
                  {session.user?.name || session.user?.email || "Valued Customer"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                href="/orders"
                onClick={onClose}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 transition-colors"
              >
                <Image
                  src="/icons/icon-profile-user.png"
                  alt="User"
                  width={14}
                  height={14}
                  className="h-3.5 w-3.5 object-contain opacity-70"
                /> My Orders
              </Link>
              <Link
                href="/wishlist"
                onClick={onClose}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 transition-colors"
              >
                <Heart size={14} className="text-red-500" /> Wishlist
              </Link>
            </div>

            <button
              onClick={() => {
                signOut();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-600/10 hover:bg-amber-600/20 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-bold transition-colors mt-2"
            >
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </>
      )}
    </nav>
  );
}
