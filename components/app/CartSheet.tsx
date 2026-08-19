"use client";

import { AlertTriangle, Loader2, ShoppingBag, X, Minus, Plus, Trash2, Bone, ShieldCheck, CreditCard, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useCartItems,
  useCartIsOpen,
  useCartActions,
  useTotalItems,
} from "@/lib/store/cart-store-provider";
import { useCartStock } from "@/lib/hooks/useCartStock";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { Button } from "@/components/ui/button";

export function CartSheet() {
  const items = useCartItems();
  const isOpen = useCartIsOpen();
  const totalItems = useTotalItems();
  const { closeCart } = useCartActions();
  const { stockMap, isLoading, hasStockIssues } = useCartStock(items);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex w-full flex-col sm:max-w-md gap-0 bg-white p-0 border-l border-zinc-200">

        {/* Custom Header */}
        <SheetHeader className="px-6 py-4 border-b border-zinc-100 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <Image 
              src="/favicon.png" 
              alt="Stephan's" 
              width={24} 
              height={24} 
              className="object-contain"
            />
            <SheetTitle className="text-xl font-bold text-[#c77e35]">Your Cart</SheetTitle>
          </div>
          <div className="relative">
            <ShoppingBag className="h-6 w-6 text-[#c77e35]" />
            <span className="absolute -top-1.5 -right-1.5 bg-[#c77e35] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          </div>
        </SheetHeader>


        {items.length === 0 ? (
          <div className="flex flex-1 flex-col h-full overflow-hidden bg-white">
            {/* Top section: Big Image */}
            <div className="flex-1 flex items-center justify-center p-6 animate-in fade-in">
              <div className="relative w-full h-full min-h-[300px]">
                <Image 
                  src="/empty-cart-pet.png" 
                  alt="Empty Cart" 
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Bottom section: Text and Button */}
            <div className="p-6 bg-white border-t border-zinc-100 flex flex-col items-center space-y-6 pb-8 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)]">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-zinc-900">
                  Your cart is feeling lonely!
                </h3>
                <p className="text-sm text-zinc-500 max-w-[280px] mx-auto">
                  Looks like you haven't added anything to your cart yet. Discover our latest collections.
                </p>
              </div>

              <Link href="/shop" onClick={closeCart} className="w-full">
                <Button className="w-full bg-[#D35122] hover:bg-[#B54218] text-white font-bold h-14 uppercase tracking-wider text-base shadow-sm group transition-all duration-300">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Stock Issues Banner */}
            {hasStockIssues && !isLoading && (
              <div className="bg-amber-50 border-b border-amber-100 px-6 py-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">
                    Some items in your cart have availability issues. Please review before checking out.
                  </p>
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                {items.map((item) => (
                  <CartItem
                    key={item.productId}
                    item={item}
                    stockInfo={stockMap.get(item.productId)}
                  />
                ))}
              </div>
            </div>

            {/* Footer / Summary */}
            <div className="bg-[#fcfbf9] border-t border-zinc-100 p-6">
              <CartSummary hasStockIssues={hasStockIssues} />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
