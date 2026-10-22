"use client";

import { useWishlistStore, useWishlistActions } from "@/lib/store/wishlist-store-provider";
import { useCartActions } from "@/lib/store/cart-store-provider";
import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);
  const { removeItem, clearWishlist } = useWishlistActions();
  const { addItem } = useCartActions();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = (item: any) => {
    addItem({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
    });
    toast.success("Added to cart");
  };

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF7F2]">
        <div className="animate-pulse text-[#4E2A15] font-serif text-lg">Loading your wishlist...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#EAE3D9]">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#222222]">My Wishlist</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {items.length === 1 ? "1 saved item" : `${items.length} saved items`}
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => {
                clearWishlist();
                toast.info("Wishlist cleared");
              }}
              className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-[#c77e35] transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#EAE3D9]/50 flex items-center justify-center mb-4 text-[#c77e35]">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-serif text-[#222222] mb-2">Your wishlist is empty</h2>
            <p className="text-sm text-zinc-500 max-w-md mb-8">
              Save your favorite pet foods, toys, and accessories to keep track of them here.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#c77e35] text-white text-sm font-semibold hover:bg-[#5a3319] transition-colors shadow-sm"
            >
              Explore Shop
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map((item) => (
              <div
                key={item.productId}
                className="group relative bg-white rounded-2xl p-4 flex flex-col border border-[#EAE3D9] hover:shadow-lg transition-all"
              >
                {/* Remove button */}
                <button
                  onClick={() => {
                    removeItem(item.productId);
                    toast.info("Removed from wishlist");
                  }}
                  className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Image */}
                <Link
                  href={item.slug ? `/shop/${item.slug}` : "/shop"}
                  className="aspect-square w-full rounded-xl bg-[#F4F1EA] flex items-center justify-center overflow-hidden mb-3 relative"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      unoptimized
                      className="object-contain p-4 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <Heart className="w-8 h-8 text-zinc-300" />
                  )}
                </Link>

                {/* Details */}
                <Link
                  href={item.slug ? `/shop/${item.slug}` : "/shop"}
                  className="font-semibold text-sm text-[#222222] line-clamp-2 hover:text-[#c77e35] transition-colors mb-2"
                >
                  {item.name}
                </Link>

                <div className="mt-auto pt-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-[#4E2A15]">
                    {formatPrice(item.price, "Tsh")}
                  </span>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="p-2 rounded-full bg-[#FAF7F2] hover:bg-[#c77e35] hover:text-white text-[#4E2A15] transition-colors"
                    aria-label="Add to cart"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
