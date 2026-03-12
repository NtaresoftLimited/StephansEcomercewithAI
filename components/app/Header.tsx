"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, Search, Menu, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useCartActions, useTotalItems } from "@/lib/store/cart-store-provider";
import { SearchModal } from "./SearchModal";
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
    { name: "Shop Page", href: "/products" },
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
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out",
          isScrolled
            ? "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 h-16 shadow-sm"
            : "bg-transparent h-20"
        )}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile Menu Trigger */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground hover:bg-transparent">
                  <Menu className="h-5 w-5" strokeWidth={1.5} />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-background border-r border-border p-0">
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
                  <nav className="flex flex-col gap-6">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="text-lg font-medium text-foreground/80 hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    ))}
                    <Link href="/products/offers" className="text-lg font-medium text-accent-foreground hover:text-foreground transition-colors">
                      Offers
                    </Link>
                    <Link href="/stores" className="text-lg font-medium text-foreground/80 hover:text-foreground transition-colors">
                      Locations
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
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

          {/* Desktop Navigation - Centered Pill that expands */}
          <div className="hidden lg:flex flex-1 justify-center px-4">
            <nav
              ref={navRef}
              className={cn(
                "flex items-center transition-all duration-500 relative",
                isScrolled
                  ? "bg-transparent border-transparent shadow-none p-0"
                  : "bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl rounded-full p-1 border border-zinc-200/50 dark:border-zinc-800/40 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.02)]"
              )}
              onMouseLeave={() => setHoverRect(null)}
            >
              {/* Sliding Indicator */}
              {(hoverRect || activeRect) && (
                <div
                  className={cn(
                    "absolute transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-0",
                    isScrolled
                      ? "h-[calc(100%-4px)] top-[2px] rounded-lg bg-[#0f1d07]/10 dark:bg-zinc-100" // Subtle box when expanded
                      : "h-[calc(100%-8px)] top-[4px] rounded-full bg-[#0f1d07] dark:bg-zinc-100"
                  )}
                  style={{
                    left: (hoverRect?.left ?? activeRect?.left ?? 0) + (isScrolled ? 0 : 4),
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
                      "text-[13px] font-bold tracking-tight px-6 py-2 rounded-full transition-all relative z-10 duration-300",
                      isScrolled
                        ? (isActive || isHovered) ? "text-[#0f1d07] dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400 hover:text-[#0f1d07]"
                        : (isActive || isHovered) ? "text-[#90f188] dark:text-zinc-900" : "text-[#0f1d07] dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
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
            "flex items-center gap-2 transition-all duration-500",
            isScrolled
              ? "bg-transparent border-transparent"
              : "bg-white/40 dark:bg-zinc-900/20 backdrop-blur-md rounded-full p-1 border border-zinc-200/20 shadow-sm"
          )}>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-foreground/70 hover:text-foreground transition-all rounded-full hover:bg-white/50 dark:hover:bg-zinc-800/50"
            >
              <Search className="h-4 w-5" strokeWidth={1.5} />
              <span className="sr-only">Search</span>
            </button>

            {/* User Account */}
            <div className="hidden sm:block">
              {status === "authenticated" ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/orders"
                    className="p-2 text-foreground/70 hover:text-foreground transition-all rounded-full hover:bg-white/50 dark:hover:bg-zinc-800/50"
                  >
                    <User className="h-4 w-5" strokeWidth={1.5} />
                    <span className="sr-only">Account</span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors ml-1"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="p-2 text-foreground/70 hover:text-foreground transition-all rounded-full hover:bg-white/50 dark:hover:bg-zinc-800/50"
                >
                  <User className="h-4 w-5" strokeWidth={1.5} />
                  <span className="sr-only">Sign in</span>
                </Link>
              )}
            </div>

            <button
              className="relative p-2 text-foreground/70 hover:text-foreground transition-all rounded-full hover:bg-white/50 dark:hover:bg-zinc-800/50 group"
              onClick={openCart}
            >
              <ShoppingBag className="h-4 w-5" strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-600 text-[8px] font-extrabold text-white shadow-sm ring-1 ring-white">
                  {totalItems > 99 ? "99" : totalItems}
                </span>
              )}
              <span className="sr-only">Open cart</span>
            </button>
          </div>
        </div>
      </header>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
