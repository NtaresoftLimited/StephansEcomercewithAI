"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, CreditCard } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getPaymentMethods } from "@/app/actions/odoo";

interface PaymentMethod {
    id: number;
    name: string;
    image?: string;
    journalId?: number;
}

interface PaymentMethodsProps {
    onSelect: (method: PaymentMethod) => void;
    selectedMethodId?: number;
}

export function PaymentMethods({ onSelect, selectedMethodId }: PaymentMethodsProps) {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchMethods() {
            try {
                const data = await getPaymentMethods();
                setMethods(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load payment methods");
            } finally {
                setLoading(false);
            }
        }
        fetchMethods();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8 text-red-500 text-sm bg-red-50 rounded-lg">
                {error}
            </div>
        );
    }

    if (methods.length === 0) {
        return (
            <div className="text-center py-8 text-zinc-400 text-sm bg-zinc-50 rounded-lg">
                No payment methods available.
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {methods.map((method) => (
                    <button
                        key={method.id}
                        onClick={() => onSelect(method)}
                        className={cn(
                            "relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left group hover:scale-[1.02]",
                            selectedMethodId === method.id
                                ? "border-[#6b3e1e] bg-[#6b3e1e]/5 shadow-sm"
                                : "border-zinc-100 bg-white hover:border-[#6b3e1e]/30 hover:bg-zinc-50"
                        )}
                    >
                        <div className="h-12 w-12 rounded-lg bg-white border border-zinc-100 flex items-center justify-center shrink-0 overflow-hidden relative">
                            {method.image ? (
                                // Odoo images are usually base64. Ensure we handle it correctly.
                                // Next/Image with base64 src requires width/height or fill.
                                // We use standard img tag for base64 simplicity or Next Image if performance critical.
                                // Since these are small icons, standard img is fine, but Next Image is better for consistency.
                                <Image
                                    src={`data:image/png;base64,${method.image}`}
                                    alt={method.name}
                                    width={48}
                                    height={48}
                                    className="object-contain p-2"
                                />
                            ) : (
                                <CreditCard className="h-6 w-6 text-zinc-300" />
                            )}
                        </div>

                        <div className="flex-1">
                            <span className={cn(
                                "block font-bold text-sm transition-colors",
                                selectedMethodId === method.id ? "text-[#6b3e1e]" : "text-zinc-700 group-hover:text-zinc-900"
                            )}>
                                {method.name}
                            </span>
                        </div>

                        {selectedMethodId === method.id && (
                            <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-[#6b3e1e] flex items-center justify-center shadow-sm animate-in zoom-in-50">
                                <Check className="h-3 w-3 text-white" strokeWidth={3} />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
