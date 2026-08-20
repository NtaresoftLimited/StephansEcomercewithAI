"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, Search, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useCartActions, useTotalItems } from "@/lib/store/cart-store-provider";
import { SearchModal } from "./SearchModal";
import { SecondaryStickyHeader } from "./SecondaryStickyHeader";
import { MobileNavMenu } from "./MobileNavMenu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const { data: session, status } = useSession();
  const { openCart } = useCartActions();
  const totalItems = useTotalItems();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Home page check
  const isHomePage = pathname === "/";

  // Nav indicator state
  const [activeRect, setActiveRect] = useState<{ left: number; width: number } | null>(null);
  const [hoverRect, setHoverRect] = useState<{ left: number; width: number } | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Shop", href: "/shop" },
    { name: "Grooming", href: "/grooming" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // Helper to update rect
  const updateActiveRect = () => {
    if (!navRef.current) return;
    const activeLink = Array.from(navRef.current.querySelectorAll("a")).find(
      (a) => a.getAttribute("href") === pathname
    );
    if (activeLink) {
      const parentRect = navRef.current.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      setActiveRect({
        left: linkRect.left - parentRect.left,
        width: linkRect.width,
      });
    } else {
      setActiveRect(null);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(updateActiveRect, 100);
    window.addEventListener("resize", updateActiveRect);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateActiveRect);
    };
  }, [pathname]);

  return (
    <>
      {isHomePage && (
        <header
          className={cn(
            "fixed left-0 right-0 z-[5000] transition-all duration-500 ease-in-out",
            isScrolled
              ? "-top-full opacity-0 pointer-events-none"
              : "top-0 bg-transparent h-[80px] opacity-100"
          )}
        >
          <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Mobile Menu Trigger */}
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="group text-[#c77e35] hover:bg-transparent hover:text-[#c77e35]" aria-label="Toggle navigation menu">
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
                <SheetContent side="left" className="w-full sm:max-w-none bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 p-0 overflow-y-auto">
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


            {/* Desktop Navigation - Centered Pill that expands */}
            <div className="hidden lg:flex flex-1 justify-center px-4">
              <nav
                ref={navRef}
                className={cn(
                  "flex items-center transition-all duration-500 relative",
                  isScrolled
                    ? "bg-transparent border-transparent shadow-none p-0"
                    : "bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl rounded-full h-[34px] p-0.5 border border-zinc-200/50 dark:border-zinc-800/40 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.02)]"
                )}
                onMouseLeave={() => setHoverRect(null)}
              >
                {/* Sliding Indicator */}
                {(hoverRect || activeRect) && (
                  <div
                    className={cn(
                      "absolute transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-0",
                      isScrolled
                        ? "h-[calc(100%-4px)] top-[2px] rounded-lg bg-[#c77e35]/10 dark:bg-zinc-100" // Subtle box when expanded
                        : "h-[calc(100%-4px)] top-[2px] rounded-full bg-[#c77e35] dark:bg-zinc-100"
                    )}
                    style={{
                      left: (hoverRect?.left ?? activeRect?.left ?? 0) + (isScrolled ? 0 : 2),
                      width: (hoverRect?.width ?? activeRect?.width ?? 0),
                    }}
                  />
                )}

                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const navLinks = navRef.current?.querySelectorAll("a") || [];
                  const linkElement = Array.from(navLinks).find(a => a.getAttribute("href") === link.href);
                  const isHovered = !!(hoverRect && linkElement && 
                    linkElement.getBoundingClientRect().left - navRef.current!.getBoundingClientRect().left === hoverRect.left);

                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onMouseEnter={(e) => {
                        const parentRect = navRef.current!.getBoundingClientRect();
                        const linkRect = e.currentTarget.getBoundingClientRect();
                        setHoverRect({
                          left: linkRect.left - parentRect.left,
                          width: linkRect.width,
                        });
                      }}
                      className={cn(
                        "text-[13px] font-bold tracking-tight px-6 h-full flex items-center rounded-full transition-all relative z-10 duration-300",
                        isScrolled
                          ? (isActive || isHovered) ? "text-[#c77e35] dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400 hover:text-[#c77e35]"
                          : (isActive || isHovered) ? "text-white dark:text-zinc-900" : "text-[#c77e35] dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                      )}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Actions - Right Aligned */}
            <div className={cn(
              "flex items-center gap-1 transition-all duration-500",
              isScrolled
                ? "bg-transparent border-transparent"
                : "bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl rounded-full h-[34px] p-0.5 border border-zinc-200/50 dark:border-zinc-800/40 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.02)]"
            )}>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="h-full px-2 text-zinc-600 dark:text-zinc-400 hover:text-[#c77e35] dark:hover:text-zinc-100 transition-all rounded-full hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 flex items-center justify-center overflow-hidden"
                aria-label="Search products"
              >
                <Image
                  src="/icons/icon-search-glass.png"
                  alt="Search"
                  width={16}
                  height={16}
                  className="h-4 w-4 object-contain opacity-70 hover:opacity-100 transition-all"
                />
                <span className="sr-only">Search</span>
              </button>

              {/* User Account */}
              <div className="hidden sm:block h-full">
                {status === "authenticated" ? (
                  <div className="flex items-center gap-1 h-full">
                    <Link
                      href="/orders"
                      className="h-full px-2 text-zinc-600 dark:text-zinc-400 hover:text-[#c77e35] dark:hover:text-zinc-100 transition-all rounded-full hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 flex items-center justify-center overflow-hidden"
                      aria-label="My Account"
                    >
                      <Image
                        src="/icons/icon-profile-user.png"
                        alt="Account"
                        width={16}
                        height={16}
                        className="h-4 w-4 object-contain opacity-70 hover:opacity-100 transition-all"
                      />
                      <span className="sr-only">Account</span>
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-[#c77e35] transition-colors px-2 py-1"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="h-full px-2 text-zinc-600 dark:text-zinc-400 hover:text-[#c77e35] dark:hover:text-zinc-100 transition-all rounded-full hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 flex items-center justify-center overflow-hidden"
                    aria-label="Log in"
                  >
                    <Image
                      src="/icons/icon-profile-user.png"
                      alt="Sign in"
                      width={16}
                      height={16}
                      className="h-4 w-4 object-contain opacity-70 hover:opacity-100 transition-all"
                    />
                    <span className="sr-only">Sign in</span>
                  </Link>
                )}
              </div>

              <Link
                href="/cart"
                className="relative h-full px-2 text-zinc-600 dark:text-zinc-400 hover:text-[#c77e35] dark:hover:text-zinc-100 transition-all rounded-full hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 group flex items-center justify-center overflow-hidden"
                aria-label="Open shopping cart"
              >
                <Image
                  src="/icons/icon-shopping-bag.png"
                  alt="Bag"
                  width={16}
                  height={16}
                  className="h-4 w-4 object-contain opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all"
                />
                {totalItems > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c77e35] text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-900 transition-transform group-hover:scale-110">
                    {totalItems > 99 ? "99" : totalItems}
                  </span>
                )}
                <span className="sr-only">Open cart</span>
              </Link>
            </div>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 transition-opacity hover:opacity-80">
              <Image
                src="/logo.png"
                alt="Stephan's Pet Store"
                width={160}
                height={45}
                className={cn(
                  "h-7 w-auto transition-all duration-500",
                  isScrolled ? "scale-95" : "scale-100"
                )}
                priority
              />
            </Link>
          </div>
        </header>
      )}

      <SecondaryStickyHeader isScrolled={!isHomePage || isScrolled} onSearchOpen={() => setIsSearchOpen(true)} />

      {/* Spacer to prevent content overlap under the massive fixed Secondary Header on inner pages */}
      {!isHomePage && <div className="h-[96px] lg:h-[140px] w-full shrink-0" aria-hidden="true" />}

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
