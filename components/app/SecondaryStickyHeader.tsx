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
      {/* 1. TOP INFO BAR (Call Us, Email, Chat) */}
      <div className="bg-[#c77e35] text-white py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between text-[11px] font-bold tracking-tight">
          <div className="hidden md:block opacity-90">
            Now Delivering Across Tanzania
          </div>
          <div className="flex items-center gap-5 ml-auto">
            <a
              href="tel:+255786627873"
              className="flex items-center gap-1.5 hover:text-amber-200 transition-colors"
            >
              <Phone className="h-3 w-3" /> Call Us
            </a>
            <a
              href="mailto:info@stephanspetstore.co.tz"
              className="flex items-center gap-1.5 hover:text-amber-200 transition-colors"
            >
              <Mail className="h-3 w-3" /> Email Us
            </a>
            <a
              href="https://wa.me/255769324445"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-green-400 transition-colors"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-3.5 w-3.5 fill-current"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.131.57-.074 1.758-.706 2.006-1.388.248-.682.248-1.265.173-1.388-.075-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat With Us
            </a>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE BAR (Logo, Search, Actions) */}
      <div className="border-b border-zinc-100 dark:border-zinc-800 py-3 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center gap-4 sm:gap-6">
          {/* Mobile Menu Trigger */}
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
                    className="block h-8 w-8 bg-[#c77e35] opacity-70 transition-opacity group-hover:opacity-100"
                    style={{
                      WebkitMaskImage: "url('/line-3.svg')",
                      maskImage: "url('/line-3.svg')",
                      WebkitMaskPosition: "center",
                      maskPosition: "center",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                    }}
                  />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-full sm:max-w-none bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 p-0 overflow-y-auto z-[6000]"
              >
                <div className="flex flex-col h-full p-6">
                  <div className="mb-8">
                    <Image
                      src="/logo.png"
                      alt="Stephan's Pet Store"
                      width={140}
                      height={40}
                      className="h-8 w-auto opacity-90"
                    />
                  </div>
                  <MobileNavMenu onClose={() => setIsMobileMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 flex items-center"
            aria-label="Stephan's Pet Store Home"
          >
            <Image
              src="/logo.png"
              alt="Stephan's Pet Store"
              width={140}
              height={40}
              className="h-9 w-auto dark:invert"
            />
          </Link>

          {/* Search Bar - Large as requested */}
          <div className="flex-1 max-w-2xl hidden md:flex items-center relative">
            <div className="flex-1 flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-[#c77e35]/20 focus-within:border-[#c77e35]">
              <Search className="h-4 w-4 text-zinc-400 ml-4 shrink-0" />
              <input
                type="text"
                placeholder="Search For Products, Brands, and More..."
                className="w-full bg-transparent border-none focus:ring-0 text-[13px] px-3 py-2.5 text-zinc-800 dark:text-zinc-200"
                onFocus={onSearchOpen}
                aria-label="Search input"
              />
              <button
                type="button"
                className="bg-[#c77e35] text-white px-6 py-2.5 text-[12px] font-bold uppercase tracking-wider hover:bg-[#5a3419] transition-colors"
                aria-label="Search"
              >
                Search
              </button>
            </div>
          </div>

          {/* Actions (Login, Location, Wishlist, Bag) */}
          <div className="flex items-center gap-3 sm:gap-6 ml-auto">
            {/* Search (Mobile Only) */}
            <button
              type="button"
              onClick={onSearchOpen}
              className="flex md:hidden flex-col items-center gap-1 group"
              aria-label="Search products"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center group-hover:bg-amber-50 dark:group-hover:bg-amber-950/30 transition-colors overflow-hidden">
                <Image
                  src="/icons/icon-search-glass.png"
                  alt="Search"
                  width={16}
                  height={16}
                  className="h-4 w-4 object-contain opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all"
                />
              </div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
                Search
              </span>
            </button>

            <Link
              href="/login"
              className="hidden md:flex flex-col items-center gap-1 group"
              aria-label="Log in"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center group-hover:bg-amber-50 dark:group-hover:bg-amber-950/30 transition-colors">
                <User className="h-4 w-4 text-zinc-600 dark:text-zinc-400 group-hover:text-amber-600 transition-colors" />
              </div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
                Log in
              </span>
            </Link>

            <button
              type="button"
              onClick={handleTrackLocation}
              disabled={isLocating}
              className="hidden md:flex flex-col items-center gap-1 group disabled:opacity-70"
              aria-label="Track my location"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center group-hover:bg-amber-50 dark:group-hover:bg-amber-950/30 transition-colors">
                {isLocating ? (
                  <Loader2 className="h-4 w-4 text-amber-600 animate-spin" />
                ) : (
                  <MapPin
                    className={cn(
                      "h-4 w-4 transition-colors",
                      userLocation
                        ? "text-amber-600"
                        : "text-zinc-600 dark:text-zinc-400 group-hover:text-amber-600",
                    )}
                  />
                )}
              </div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight truncate max-w-[60px]">
                {userLocation || "Location"}
              </span>
            </button>

            <Link
              href="/wishlist"
              className="hidden md:flex flex-col items-center gap-1 group"
              aria-label="Wishlist"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center group-hover:bg-amber-50 dark:group-hover:bg-amber-950/30 transition-colors">
                <Heart className="h-4 w-4 text-zinc-600 dark:text-zinc-400 group-hover:text-amber-600 transition-colors" />
              </div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
                Wishlist
              </span>
            </Link>

            <Link
              href="/cart"
              className="flex flex-col items-center gap-1 group relative"
              aria-label="Open shopping cart"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center group-hover:bg-amber-50 dark:group-hover:bg-amber-950/30 transition-colors overflow-hidden">
                <Image
                  src="/icons/icon-shopping-bag.png"
                  alt="Bag"
                  width={16}
                  height={16}
                  className="h-4 w-4 object-contain opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all"
                />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c77e35] text-[9px] font-bold text-white ring-2 ring-white dark:ring-zinc-950">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
                Bag
              </span>
            </Link>
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
