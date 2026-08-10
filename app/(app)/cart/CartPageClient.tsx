"use client";

import {
  AlertTriangle,
  ArrowRight,
  Award,
  Headphones,
  Heart,
  Leaf,
  Search,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartItem } from "@/components/app/CartItem";
import { CartSummary } from "@/components/app/CartSummary";
import { useCartStock } from "@/lib/hooks/useCartStock";
import { useCartItems, useTotalItems } from "@/lib/store/cart-store-provider";

const leftPromises = [
  { icon: Award, label: "Premium\nQuality" },
  { icon: Heart, label: "Trusted by\nPet Parents" },
  { icon: Truck, label: "Reliable\nDelivery" },
];

const rightPromises = [
  { icon: Leaf, label: "Carefully Selected\nProducts" },
  { icon: ShieldCheck, label: "Safe & Secure\nCheckout" },
  { icon: Headphones, label: "We're Here to Help\nAlways" },
];

export function CartPageClient() {
  const items = useCartItems();
  const totalItems = useTotalItems();
  const { stockMap, isLoading, hasStockIssues } = useCartStock(items);
  const router = useRouter();

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row font-sans text-[#2d2a24]">
      {/* LEFT SIDEBAR */}
      <div className="hidden lg:block lg:w-[35%] bg-[#efece1]">
        <aside className="sticky top-0 flex h-screen flex-col justify-between overflow-y-auto p-8 xl:p-14">
          {/* Middle: Content */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="font-serif text-4xl leading-[1.1] tracking-tight xl:text-[3.5rem] text-[#1a1816]">
              Everything
              <br />
              your pet
              <br />
              deserves.
            </h1>
            <div className="my-8 h-[3px] w-16 bg-[#bda88a]"></div>
            <p className="max-w-[280px] text-[15px] leading-relaxed text-[#4a453e]">
              Premium products, trusted brands, and exceptional care for happy
              pets and happy homes.
            </p>
          </div>

          {/* Bottom: Left Promises */}
          <div className="grid grid-cols-3 divide-x divide-[#d8d2c6] pt-8">
            {leftPromises.map((promise, i) => (
              <div
                key={i}
                className={`flex flex-col items-start justify-start text-left ${i === 0 ? 'pr-4' : 'px-4'}`}
              >
                <promise.icon className="mb-3 h-6 w-6 text-[#2d2a24] stroke-[1.5]" />
                <span className="whitespace-pre-line text-[12px] font-medium text-[#4a453e]">
                  {promise.label}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* RIGHT MAIN AREA */}
      <div className="relative flex w-full flex-col bg-[#fdfbf7] p-8 lg:w-[65%] xl:p-14 min-h-screen">
        <h2 className="font-serif text-4xl text-[#1a1816] mt-4 xl:mt-0">
          Your Cart
        </h2>
        <hr className="my-8 border-[#e6e2d8]" />

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="relative flex h-[340px] w-[340px] mb-8">
              <Image
                src="/empty-cart-bag.avif"
                alt="Empty Cart Bag"
                fill
                className="object-contain"
                priority
              />
            </div>

            <h3 className="font-serif text-4xl text-[#1a1816]">
              Your cart is empty.
            </h3>
            <div className="my-6 h-[2px] w-16 bg-[#bda88a]"></div>

            <p className="max-w-[300px] text-center text-[15px] leading-relaxed text-[#4a453e]">
              Looks like you haven&apos;t added
              <br />
              anything to your cart yet.
            </p>
            <p className="mt-4 max-w-[300px] text-center text-[15px] leading-relaxed text-[#4a453e]">
              Explore our collection and find
              <br />
              the perfect things for your pet.
            </p>

            <Link
              href="/shop"
              className="group mt-10 inline-flex h-14 w-[260px] items-center justify-between rounded-lg bg-[#3e332a] px-6 text-white transition-all hover:bg-[#2a221c]"
            >
              <span className="font-medium">Shop Collection</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <div className="mt-14 flex items-center justify-center gap-4 text-[#8a8070]">
              <div className="h-px w-16 bg-[#e6e2d8]"></div>
              <span className="font-serif text-lg tracking-wide text-[#8a8070]">
                Happy pet, Happy home.
              </span>
              <div className="h-px w-16 bg-[#e6e2d8]"></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-zinc-900">
                Items ({totalItems})
              </h3>
            </div>

            {hasStockIssues && !isLoading && (
              <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                  <p className="text-sm font-medium leading-relaxed text-amber-900">
                    Some items have availability issues. Please review them
                    before checkout.
                  </p>
                </div>
              </div>
            )}

            <div className="flex-1 space-y-6 overflow-y-auto pr-4">
              {items.map((item) => (
                <CartItem
                  key={item.productId}
                  item={item}
                  stockInfo={stockMap.get(item.productId)}
                />
              ))}
            </div>

            <div className="mt-10 border-t border-[#e6e2d8] pt-8">
              <CartSummary hasStockIssues={hasStockIssues} />
            </div>
          </div>
        )}

        {/* Bottom Right Promises */}
        {items.length === 0 && (
          <div className="mt-16 grid grid-cols-3 divide-x divide-[#d8d2c6] border-t border-[#e6e2d8] pt-10">
            {rightPromises.map((promise, i) => (
              <div
                key={i}
                className={`flex flex-col items-start justify-start text-left ${i === 0 ? 'pr-4' : 'px-4'}`}
              >
                <promise.icon className="mb-3 h-6 w-6 text-[#2d2a24] stroke-[1.5]" />
                <span className="whitespace-pre-line text-[11px] font-medium text-[#4a453e]">
                  {promise.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
