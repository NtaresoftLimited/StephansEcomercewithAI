"use client";

import { useState } from "react";
import { Check, Edit, ShoppingBag, Loader2 } from "lucide-react";
import { AddressForm } from "./AddressForm";
import { PaymentMethods } from "./PaymentMethods";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CheckoutFlow() {
    const [step, setStep] = useState<1 | 2>(1);
    const [addressData, setAddressData] = useState<any>(null);
    const [selectedMethod, setSelectedMethod] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Once address is complete, we move to payment
    const handleAddressComplete = (data: any) => {
        setAddressData(data);
        setStep(2);
        // In here we could also calculate shipping based on address
    };

    const handleEditAddress = () => {
        setStep(1);
        setSelectedMethod(null);
    };

    const handlePlaceOrder = async () => {
        if (!addressData || !selectedMethod) return;

        setIsProcessing(true);
        try {
            // Here we would call Server Action to create order in Odoo
            // const order = await createOrder(cartItems, addressData, selectedMethod);
            // if (order.url) window.location.href = order.url; // e.g. payment gateway

            await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay
            alert(`Order placed successfully with ${selectedMethod.name}!`);
            window.location.href = "/orders/confirmation"; // Redirect to thank you page
        } catch (error) {
            console.error("Order failed", error);
            alert("Failed to place order. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Step 1: Address */}
            <section className={cn(
                "bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm transition-all duration-300",
                step === 1 ? "ring-2 ring-[#6b3e1e]/10" : "opacity-80 hover:opacity-100"
            )}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
                            step === 1 ? "bg-zinc-900 text-white" : "bg-green-500 text-white"
                        )}>
                            {step > 1 ? <Check className="h-4 w-4" /> : "1"}
                        </div>
                        <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-wide">Shipping Address</h2>
                    </div>
                    {step > 1 && (
                        <Button variant="ghost" size="sm" onClick={handleEditAddress} className="text-xs text-[#6b3e1e] hover:bg-[#6b3e1e]/5">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                        </Button>
                    )}
                </div>

                {step === 1 ? (
                    <AddressForm onComplete={handleAddressComplete} />
                ) : (
                    <div className="pl-11 text-sm text-zinc-600">
                        <p className="font-bold text-zinc-900">{addressData.firstName} {addressData.lastName}</p>
                        <p>{addressData.address}</p>
                        <p>{addressData.city}, {addressData.region} {addressData.postalCode}</p>
                        <p className="mt-1">{addressData.phone}</p>
                    </div>
                )}
            </section>

            {/* Step 2: Payment */}
            <section className={cn(
                "bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm transition-all duration-300",
                step === 2 ? "ring-2 ring-[#6b3e1e]/10 opacity-100" : "opacity-50 pointer-events-none grayscale"
            )}>
                <div className="flex items-center gap-3 mb-6">
                    <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
                        step === 2 ? "bg-zinc-900 text-white" : "bg-zinc-200 text-zinc-500"
                    )}>
                        2
                    </div>
                    <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-wide">Payment Method</h2>
                </div>

                <div className="pl-11">
                    {step === 2 && (
                        <div className="space-y-6">
                            <PaymentMethods
                                onSelect={setSelectedMethod}
                                selectedMethodId={selectedMethod?.id}
                            />

                            <div className="pt-4 border-t border-zinc-100">
                                <Button
                                    onClick={handlePlaceOrder}
                                    disabled={!selectedMethod || isProcessing}
                                    className="w-full h-14 bg-[#D35122] hover:bg-[#B54218] text-white font-bold uppercase tracking-wider text-lg shadow-md active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Processing Order...
                                        </>
                                    ) : (
                                        <>
                                            Place Order with {selectedMethod?.name || "..."}
                                        </>
                                    )}
                                </Button>
                                <p className="text-center text-xs text-zinc-400 mt-3">
                                    By placing this order, you agree to our Terms of Service and Privacy Policy.
                                </p>
                            </div>
                        </div>
                    )}
                    {step < 2 && (
                        <p className="text-sm text-zinc-400">Complete shipping address to unlock payment options.</p>
                    )}
                </div>
            </section>

        </div>
    );
}
