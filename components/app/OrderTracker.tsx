"use client";

import { Check, Truck, Package, RotateCcw, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderTrackerProps {
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    estimatedDelivery?: string;
}

const STEPS = [
    { id: "pending", label: "Placed", icon: Package },
    { id: "processing", label: "Confirmed", icon: Check },
    { id: "shipped", label: "Shipped", icon: Truck },
    { id: "delivered", label: "Delivered", icon: Home },
];

export function OrderTracker({ status, estimatedDelivery }: OrderTrackerProps) {
    if (status === "cancelled") {
        return (
            <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-center gap-4 text-red-700">
                <RotateCcw className="h-6 w-6" />
                <div>
                    <h3 className="font-bold">Order Cancelled</h3>
                    <p className="text-sm">This order has been cancelled.</p>
                </div>
            </div>
        );
    }

    const currentStepIndex = STEPS.findIndex((s) => s.id === status);
    // If status is not in STEPS (e.g. unknown), default to 0
    const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

    return (
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm w-full">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-zinc-900 uppercase tracking-wide">Order Status</h3>
                {estimatedDelivery && (
                    <span className="text-sm font-medium text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
                        Est. Delivery: {estimatedDelivery}
                    </span>
                )}
            </div>

            <div className="relative">
                {/* Progress Bar Background */}
                <div className="absolute top-5 left-0 w-full h-1 bg-zinc-100 rounded-full" />

                {/* Active Progress Bar */}
                <div
                    className="absolute top-5 left-0 h-1 bg-[#6b3e1e] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
                />

                <div className="relative flex justify-between">
                    {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = index <= activeIndex;
                        const isCurrent = index === activeIndex;

                        return (
                            <div key={step.id} className="flex flex-col items-center relative z-10 w-24">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 delay-100",
                                        isCompleted
                                            ? "bg-[#6b3e1e] border-white ring-2 ring-[#6b3e1e] text-white"
                                            : "bg-white border-zinc-100 ring-2 ring-zinc-100 text-zinc-300",
                                        isCurrent && "scale-110 shadow-lg"
                                    )}
                                >
                                    <Icon className="w-5 h-5" strokeWidth={isCompleted ? 2.5 : 2} />
                                </div>
                                <span
                                    className={cn(
                                        "mt-3 text-xs font-bold uppercase tracking-wider transition-colors duration-300 text-center",
                                        isCompleted ? "text-[#6b3e1e]" : "text-zinc-300",
                                        isCurrent && "scale-105"
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
