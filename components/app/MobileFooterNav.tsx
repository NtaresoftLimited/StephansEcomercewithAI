"use client";

import Link from "next/link";
import Image from "next/image";
import { Home, ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCartActions, useTotalItems } from "@/lib/store/cart-store-provider";
import { useChatActions } from "@/lib/store/chat-store-provider";

export function MobileFooterNav() {
    const { openChat } = useChatActions();
    const { openCart } = useCartActions();
    const totalItems = useTotalItems();
    const pathname = usePathname();

    // Hide on product detail pages to avoid overlap with sticky add to cart
    const isProductPage = pathname?.startsWith('/products/') && pathname !== '/products';
    if (isProductPage) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around bg-white/90 backdrop-blur-lg border-t border-zinc-200 px-4 sm:hidden pb-safe">
            {/* Home Link (Left) */}
            <Link
                href="/"
                className="flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-amber-600 transition-colors"
            >
                <Home className="h-5 w-5" />
                <span className="text-[10px] font-medium">Home</span>
            </Link>

            {/* Center: Talk to Sky */}
            <button
                onClick={openChat}
                className="relative -top-5 flex flex-col items-center justify-center"
            >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#6b3e1e] text-white shadow-lg shadow-[#6b3e1e]/40 border-4 border-white dark:border-zinc-950 transition-transform active:scale-95">
                    <Image
                        src="/favicon.png"
                        alt="Sky"
                        width={24}
                        height={24}
                        className="h-6 w-6"
                    />
                </div>
                <span className="mt-1 text-[10px] font-bold text-amber-700 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
                    Talk to Sky
                </span>
            </button>

            {/* Shop Page Link (Right) */}
            <Link
                href="/products"
                className="relative flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-amber-600 transition-colors"
            >
                <div className="relative">
                    <ShoppingBag className="h-5 w-5" />
                    {totalItems > 0 && (
                        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[9px] font-bold text-white shadow-sm ring-1 ring-white">
                            {totalItems > 99 ? "99" : totalItems}
                        </span>
                    )}
                </div>
                <span className="text-[10px] font-medium">Shop Page</span>
            </Link>
        </div>
    );
}
