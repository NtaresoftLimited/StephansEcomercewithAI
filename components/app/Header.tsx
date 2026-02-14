"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, User, Search, Menu, X } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useCartActions, useTotalItems } from "@/lib/store/cart-store-provider";
import { SearchModal } from "./SearchModal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const { openCart } = useCartActions();
  const totalItems = useTotalItems();
  const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Shop", href: "/products" },
    { name: "Grooming", href: "/grooming" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b",
          isScrolled
            ? "bg-background/80 backdrop-blur-md border-border h-16"
            : "bg-transparent border-transparent h-20"
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

          {/* Desktop Navigation - Centered & Minimal */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium tracking-wide text-foreground/70 hover:text-foreground transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-foreground transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Actions - Right Aligned */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-foreground/70 hover:text-foreground transition-colors rounded-full hover:bg-secondary/50"
            >
              <Search className="h-5 w-5" strokeWidth={1.5} />
              <span className="sr-only">Search</span>
            </button>

            {hasClerk && (
              <div className="hidden sm:block">
                <SignedIn>
                  <UserButton
                    afterSwitchSessionUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8 ring-1 ring-border hover:ring-foreground/20 transition-all",
                      },
                    }}
                  />
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="p-2 text-foreground/70 hover:text-foreground transition-colors rounded-full hover:bg-secondary/50">
                      <User className="h-5 w-5" strokeWidth={1.5} />
                      <span className="sr-only">Sign in</span>
                    </button>
                  </SignInButton>
                </SignedOut>
              </div>
            )}

            <button
              className="relative p-2 text-foreground/70 hover:text-foreground transition-colors rounded-full hover:bg-secondary/50 group"
              onClick={openCart}
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
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
