"use client";

import { AlertTriangle, Loader2, ShoppingBag, X, Minus, Plus, Trash2 } from "lucide-react";
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
      <SheetContent className="flex w-full flex-col sm:max-w-md gap-0 bg-background border-l border-border p-0">
        <SheetHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between space-y-0">
          <SheetTitle className="flex items-center gap-2 text-lg font-medium text-foreground tracking-wide">
            <ShoppingBag className="h-4 w-4" />
            Cart <span className="text-muted-foreground font-normal">({totalItems})</span>
          </SheetTitle>
           {/* Close button is handled by Sheet primitive, but we can style content if needed */}
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-6">
            <div className="h-16 w-16 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-foreground/40" />
            </div>
            <h3 className="text-lg font-medium text-foreground">
              Your cart is empty
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              Looks like you haven't added anything yet. Explore our products to find something for your pet.
            </p>
            <Button 
                onClick={closeCart}
                className="mt-6 rounded-full bg-foreground text-background hover:bg-foreground/90 px-8"
            >
                Start Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Stock Issues Banner - Minimalist */}
            {hasStockIssues && !isLoading && (
              <div className="bg-amber-50/50 border-b border-amber-100 px-6 py-3">
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
            <div className="bg-secondary/10 border-t border-border p-6">
                <CartSummary hasStockIssues={hasStockIssues} />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
