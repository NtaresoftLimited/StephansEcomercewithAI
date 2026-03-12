"use client";

import { AlertTriangle, Loader2, ShoppingBag, X, Minus, Plus, Trash2, Bone } from "lucide-react";
import Link from "next/link";
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
          {/* Close button is automatically rendered by SheetContent, usually on the right. 
               If we want to match the image exactly (Left X, Right Title), we'd need to hide the default close and add our own.
               For now, let's keep standard layout but style the title. */}
          <SheetTitle className="flex items-center justify-end w-full gap-3">
            <span className="text-xl font-bold text-[#6b3e1e]">Your Cart</span>
            <div className="relative">
              <ShoppingBag className="h-6 w-6 text-[#6b3e1e]" />
              <span className="absolute -top-1.5 -right-1.5 bg-[#6b3e1e] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>


        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-start pt-12 p-6 space-y-8 animate-in fade-in">
            <div className="flex flex-col items-center gap-4">
              <Bone className="w-16 h-16 text-[#6b3e1e]" strokeWidth={1.5} />
              <h3 className="text-lg font-medium text-zinc-900">
                You don't have any items in your cart!
              </h3>
            </div>

            <div className="w-full space-y-4">
              <Link href="/products?category=dogs" onClick={closeCart} className="w-full">
                <Button className="w-full bg-[#D35122] hover:bg-[#B54218] text-white font-bold h-14 uppercase tracking-wider text-base shadow-sm">
                  Shop Dog
                </Button>
              </Link>
              <Link href="/products?category=cats" onClick={closeCart} className="w-full">
                <Button className="w-full bg-[#D35122] hover:bg-[#B54218] text-white font-bold h-14 uppercase tracking-wider text-base shadow-sm">
                  Shop Cat
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
