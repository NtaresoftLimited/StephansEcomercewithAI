"use client";

import { useState } from "react";
import Image from "next/image";
import { useCartItems, useTotalPrice } from "@/lib/store/cart-store-provider";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";

function CartItemImage({ image, name }: { image?: string; name: string }) {
    const [error, setError] = useState(false);

    if (image && !error) {
        return (
            <Image
                src={image}
                alt={name}
                fill
                className="object-contain p-1"
                onError={() => setError(true)}
            />
        );
    }

    return (
        <div className="w-full h-full flex items-center justify-center bg-zinc-50">
            <Image 
                src="/favicon.png" 
                alt="Stephan's" 
                width={24} 
                height={24} 
                className="opacity-20 grayscale"
            />
        </div>
    );
}

export function CheckoutSummary() {
    const items = useCartItems();
    const totalPrice = useTotalPrice();

    if (items.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm text-center py-12">
                <ShoppingBag className="h-12 w-12 mx-auto text-zinc-200 mb-4" />
                <p className="text-zinc-400">Your cart is empty.</p>
                <a href="/" className="text-[#c77e35] hover:underline mt-2 inline-block text-sm font-bold">Return to Shop</a>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-zinc-900 mb-6 uppercase tracking-wide border-b border-zinc-100 pb-4 flex justify-between items-center">
                <span>Order Summary</span>
                <span className="text-xs font-normal text-zinc-400">{items.reduce((acc, item) => acc + item.quantity, 0)} Items</span>
            </h2>

            {/* Cart Items List */}
            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto scrollbar-hide">
                {items.map((item) => (
                    <div key={item.productId} className="flex gap-4 items-start">
                        <div className="h-16 w-16 bg-zinc-50 rounded-lg shrink-0 overflow-hidden relative border border-zinc-100">
                            <CartItemImage image={item.image} name={item.name} />
                            <span className="absolute top-0 right-0 bg-[#c77e35] text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-bl-lg">
                                {item.quantity}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-zinc-800 line-clamp-2 leading-tight">{item.name}</h4>
                            <p className="text-xs text-zinc-500 mt-1">{formatPrice(item.price)} each</p>
                        </div>
                        <div className="font-bold text-sm text-zinc-900">
                            {formatPrice(item.price * item.quantity)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="space-y-3 pt-6 border-t border-zinc-200">
                <div className="flex justify-between text-zinc-600 text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-zinc-600 text-sm">
                    <span>Shipping</span>
                    <span className="text-xs text-zinc-400">Calculated next step</span>
                </div>
                <div className="flex justify-between font-bold text-xl pt-4 border-t border-zinc-200 mt-2 text-[#c77e35]">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice)}</span>
                </div>
            </div>
        </div>
    );
}
