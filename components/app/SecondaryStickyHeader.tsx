"use client";

import {
  ChevronDown,
  Heart,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DEEP_NAV_MENU,
  FEATURED_NAV_GROUP_TITLES,
} from "@/lib/config/navigation";
import { useTotalItems } from "@/lib/store/cart-store-provider";
import { cn } from "@/lib/utils";
import { CategoryMegaMenu } from "./CategoryMegaMenu";
import { MobileNavMenu } from "./MobileNavMenu";

interface SecondaryStickyHeaderProps {
  isScrolled: boolean;
  onSearchOpen?: () => void;
}

function SecondaryStickyHeaderInner({
  isScrolled,
  onSearchOpen,
}: SecondaryStickyHeaderProps) {
  const totalItems = useTotalItems();
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pinnedCategoryRef = useRef<string | null>(null);

  const cancelScheduledClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openCategory = (categoryId: string) => {
    cancelScheduledClose();
    setOpenCategoryId(categoryId);
  };

  const scheduleCategoryClose = () => {
    cancelScheduledClose();
    if (pinnedCategoryRef.current) return;
    closeTimerRef.current = setTimeout(() => setOpenCategoryId(null), 180);
  };

  const pinCategoryOpen = (categoryId: string) => {
    pinnedCategoryRef.current = categoryId;
    openCategory(categoryId);
  };

  const closeCategoryMenu = () => {
    pinnedCategoryRef.current = null;
    setOpenCategoryId(null);
  };

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        pinnedCategoryRef.current = null;
        setOpenCategoryId(null);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        pinnedCategoryRef.current = null;
        setOpenCategoryId(null);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const handleTrackLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Use a reverse geocoding API or simple message for now
          // In a real app, you'd call an API here to get the city name
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          const data = await response.json();
          const locationName =
            data.address.city ||
            data.address.town ||
            data.address.suburb ||
            "Tanzania";

          setUserLocation(locationName);
          toast.success(`Location detected: ${locationName}`);

          // Optionally redirect to stores with coordinates
          // window.location.href = `/stores?lat=${latitude}&lng=${longitude}`;
        } catch (error) {
          console.error("Error geocoding:", error);
          setUserLocation("Detected");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Please allow location access to find nearest stores");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable");
            break;
          case error.TIMEOUT:
            toast.error("The request to get user location timed out");
            break;
          default:
            toast.error("An unknown error occurred while locating");
        }
      },
    );
  };

  const categories = [
    {
      name: "Dogs",
      href: "/shop?category=dogs",
      id: "dogs",
      menu: DEEP_NAV_MENU.dogs,
      featuredTitles: FEATURED_NAV_GROUP_TITLES.dogs,
    },
    {
      name: "Cats",
      href: "/shop?category=cats",
      id: "cats",
      menu: DEEP_NAV_MENU.cats,
      featuredTitles: FEATURED_NAV_GROUP_TITLES.cats,
    },
    {
      name: "Birds",
      href: "/shop?category=birds",
      id: "birds",
      menu: DEEP_NAV_MENU.birds,
      featuredTitles: FEATURED_NAV_GROUP_TITLES.birds,
    },
    {
      name: "Small Pets",
      href: "/shop?category=small-pets",
      id: "small-pets",
      menu: DEEP_NAV_MENU.smallPets,
      featuredTitles: FEATURED_NAV_GROUP_TITLES.smallPets,
    },
  ];

  return (
    <div
      ref={headerRef}
      className={cn(
        "fixed left-0 right-0 z-[4990] transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] border-b border-zinc-200 bg-white dark:bg-zinc-950",
        isScrolled
          ? "top-0 translate-y-0 opacity-100"
          : "-top-full -translate-y-[150%] opacity-0 pointer-events-none",
      )}
    >
            {/* 2. MAIN BRAND HEADER (Redesigned as per FCB) */}
      <div className="border-b border-zinc-100 dark:border-zinc-800 py-3 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl flex items-center justify-between h-14 sm:h-16">
          
          {/* LEFT: Menu (Mobile) & Search */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="group -ml-2 text-[#c77e35] hover:bg-transparent hover:text-[#c77e35]"
                    aria-label="Toggle navigation menu"
                  >
                    <span
                      aria-hidden="true"
                      className="block h-6 w-6 bg-[#c77e35]"
                      style={{
                        maskImage: 'url(/icons/icon-hamburger.svg)',
                        WebkitMaskImage: 'url(/icons/icon-hamburger.svg)',
                        maskSize: 'contain',
                        WebkitMaskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        WebkitMaskPosition: 'center',
                      }}
                    />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-0 sm:w-[350px]">
                  <MobileNavMenu onClose={() => setIsMobileMenuOpen(false)} />
                </SheetContent>
              </Sheet>
            </div>

            <button
              onClick={onSearchOpen}
              className="flex items-center gap-2 group p-2 -ml-2 lg:ml-0"
              aria-label="Open search"
            >
              <Image 
                src="/icons/icon-search-glass.png" 
                alt="Search" 
                width={20} 
                height={20} 
                className="h-5 w-5 object-contain opacity-70 group-hover:opacity-100 transition-opacity" 
              />
            </button>
          </div>

          {/* RIGHT: User, Bag, Logo */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/login"
              className="hidden sm:flex items-center justify-center group p-2"
              aria-label="Log in"
            >
              <Image 
                src="/icons/icon-profile-user.png" 
                alt="Sign in" 
                width={20} 
                height={20} 
                className="h-5 w-5 object-contain opacity-70 group-hover:opacity-100 transition-opacity" 
              />
            </Link>

            <Link
              href="/cart"
              className="flex items-center justify-center group relative p-2"
              aria-label="Open shopping cart"
            >
              <Image
                src="/icons/icon-shopping-bag.png"
                alt="Bag"
                width={20}
                height={20}
                className="h-5 w-5 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
              />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#c77e35] text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-950">
                  {totalItems > 99 ? "99" : totalItems}
                </span>
              )}
            </Link>

            <div className="pl-4 sm:pl-6 border-l border-zinc-200 dark:border-zinc-800 ml-2">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="relative h-10 w-10 sm:h-12 sm:w-12 overflow-hidden">
                  <Image
                    src="/favicon.png"
                    alt="Stephan's Pet Store Logo"
                    fill
                    className="object-contain object-center"
                  />
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="font-serif text-lg font-black tracking-tight text-zinc-900 leading-none">
                    Stephan's
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#c77e35] leading-none mt-1">
                    Pet Store
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM BAR (Navigation) */}
      <div className="relative hidden lg:block bg-white dark:bg-zinc-950 px-4 sm:px-6 lg:px-8 border-t border-zinc-100 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl flex items-center h-11 gap-8 text-[15px] font-bold text-zinc-700 dark:text-zinc-200">
          {categories.map((cat) => (
            <div
              role="none"
              key={cat.id}
              className={`group h-full flex items-center border-b-2 border-transparent transition-colors ${openCategoryId === cat.id ? "border-[#9a5d2d]" : "hover:border-[#9a5d2d]"}`}
              onMouseEnter={() => openCategory(cat.id)}
              onMouseLeave={scheduleCategoryClose}
            >
              <button
                type="button"
                aria-expanded={openCategoryId === cat.id}
                aria-controls={`mega-menu-${cat.id}`}
                onClick={() => pinCategoryOpen(cat.id)}
                className="flex h-full items-center gap-1.5 transition-colors hover:text-[#8b4f22] focus-visible:outline-none focus-visible:text-[#8b4f22]"
              >
                {cat.name}
                <ChevronDown
                  className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${openCategoryId === cat.id ? "rotate-180 text-[#8b4f22]" : ""}`}
                />
              </button>

              <section
                aria-label={`${cat.name} product categories`}
                id={`mega-menu-${cat.id}`}
                onMouseEnter={cancelScheduledClose}
                onMouseLeave={scheduleCategoryClose}
                className={`absolute left-0 right-0 top-full z-50 max-h-[calc(100vh-10rem)] w-full cursor-default overflow-y-auto border-b border-zinc-200 bg-white/[0.98] normal-case tracking-normal transition-all duration-200 dark:border-zinc-800 dark:bg-zinc-950/[0.98] ${openCategoryId === cat.id ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0 pointer-events-none"}`}
              >
                <CategoryMegaMenu
                  animalName={cat.name}
                  groups={cat.menu}
                  featuredTitles={cat.featuredTitles}
                  viewAllHref={cat.href}
                  onNavigate={closeCategoryMenu}
                />
              </section>
            </div>
          ))}

          <Link
            href="/brands"
            className="flex items-center gap-1.5 hover:text-amber-600 transition-colors h-full border-b-2 border-transparent hover:border-amber-500"
          >
            Brands
          </Link>

          <Link
            href="/grooming"
            className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors h-full border-b-2 border-transparent hover:border-emerald-500"
          >
            <Image
              src="/about/grooming-scissors.png"
              alt="Grooming"
              width={16}
              height={16}
              className="h-[16px] w-[16px] object-contain"
            />{" "}
            Grooming
          </Link>

          <Link
            href="/stores"
            className="ml-auto text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors h-full flex items-center border-b-2 border-transparent hover:border-zinc-500 gap-2"
          >
            <Image
              src="/favicon.png"
              alt="Stores"
              width={16}
              height={16}
              className="opacity-80 group-hover:opacity-100 transition-opacity"
            />
            Store locator
          </Link>
        </div>
      {/* Apple-style Backdrop Overlay */}
      <div
        className={cn(
          "absolute left-0 right-0 top-full h-[100vh] z-40 bg-zinc-900/10 backdrop-blur-md transition-all duration-300",
          openCategoryId ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
      />
      </div>
    </div>
  );
}

export function SecondaryStickyHeader(props: SecondaryStickyHeaderProps) {
  return (
    <Suspense fallback={null}>
      <SecondaryStickyHeaderInner {...props} />
    </Suspense>
  );
}
