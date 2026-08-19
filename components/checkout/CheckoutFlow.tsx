"use client";

import { useState } from "react";
import Image from "next/image";
import { AddressForm } from "./AddressForm";
import { formatPrice } from "@/lib/utils";
import { useCartItems, useTotalPrice, useCartActions } from "@/lib/store/cart-store-provider";

export function CheckoutFlow() {
    const cartItems = useCartItems();
    const totalPrice = useTotalPrice();
    const { clearCart } = useCartActions();

    const [isProcessing, setIsProcessing] = useState(false);

    // Once address is complete, place order via WhatsApp
    const handleAddressComplete = async (addressData: any) => {
        setIsProcessing(true);
        try {
            let orderNumber: string | undefined;
            let pdfUrl: string | undefined;

            try {
                // Call our API route to save the order to Sanity
                const response = await fetch("/api/orders/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        customer: addressData,
                        items: cartItems,
                        total: totalPrice
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.orderNumber) {
                        orderNumber = data.orderNumber;
                        pdfUrl = `${window.location.origin}/receipt/${orderNumber}`;
                    }
                } else {
                    console.error("Order API returned error:", response.status, await response.text().catch(() => ""));
                }
            } catch (apiErr) {
                console.error("Order API call failed, proceeding with WhatsApp anyway:", apiErr);
            }

            // Fallback order reference if the API failed
            if (!orderNumber) {
                orderNumber = `SPS-WA-${Date.now().toString(36).toUpperCase()}`;
            }

            // Build item summary for WhatsApp (so the store always knows what was ordered)
            const itemLines = cartItems.map(
                (item) => `  • ${item.name} × ${item.quantity} — TZS ${(item.price * item.quantity).toLocaleString("en-US")}`
            ).join("\n");

            // Clear cart after processing
            clearCart();

            // Construct WhatsApp message with full order details
            const receiptLine = pdfUrl
                ? `\nView my PDF receipt here: ${pdfUrl}`
                : "";

            const customerMessage =
                `Hi Stephan's Pet Store!\n` +
                `I have just placed an order on the website (Order #${orderNumber}).` +
                receiptLine +
                `\n\nItems Ordered:\n${itemLines}` +
                `\n\nTotal: TZS ${totalPrice.toLocaleString("en-US")}` +
                `\n\nCustomer Details:\n` +
                `Name: ${addressData.firstName} ${addressData.lastName}\n` +
                `Phone: ${addressData.phone}` +
                (addressData.address ? `\nAddress: ${addressData.address}` : "") +
                (addressData.city ? `, ${addressData.city}` : "");

            const encodedMessage = encodeURIComponent(customerMessage);
            const whatsappUrl = `https://wa.me/255769324445?text=${encodedMessage}`;

            window.location.href = whatsappUrl;
            
        } catch (error) {
            console.error("Order failed", error);
            alert("Failed to place order. Please try again.");
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Step 1: Address */}
            <section className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm transition-all duration-300 ring-2 ring-[#c77e35]/10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Image 
                            src="/favicon.png" 
                            alt="Stephan's" 
                            width={24} 
                            height={24} 
                            className="object-contain"
                        />
                        <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-wide">Shipping Details</h2>
                    </div>
                </div>

                <AddressForm onComplete={handleAddressComplete} isProcessing={isProcessing} />
            </section>
        </div>
    );
}
