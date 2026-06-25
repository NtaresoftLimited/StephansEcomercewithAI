import { Metadata } from 'next';
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const metadata: Metadata = {
    title: 'Secure Checkout | Stephan\'s Pet Store',
    description: 'Complete your order securely.',
};

export default function CheckoutPage() {
    return (
        <div className="grid lg:grid-cols-12 gap-12 items-start relative">
            {/* Left Column: Checkout Forms */}
            <div className="lg:col-span-7 space-y-8">
                <div className="border-b border-zinc-200 pb-4">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Checkout</h1>
                    <p className="mt-2 text-zinc-500">Complete your order securely.</p>
                </div>

                <CheckoutFlow />
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 mt-8 lg:mt-0">
                <CheckoutSummary />

                <div className="mt-8 pt-6 border-t border-zinc-100 text-left text-xs text-zinc-500 max-w-sm mx-auto space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-start gap-2.5">
                            <MapPin className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="leading-tight font-medium text-zinc-700">11 Slipway Rd, Masaki</p>
                                <p className="leading-tight font-medium text-zinc-700">58 Mikocheni A, Dar es Salaam</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 pt-1 border-t border-zinc-50">
                        <div className="flex items-center gap-2.5">
                            <Phone className="h-4 w-4 text-zinc-400 shrink-0" />
                            <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                                <a href="tel:+255786627873" className="hover:text-zinc-800 transition-colors font-medium text-zinc-700">+255 786 627 873</a>
                                <span className="text-zinc-300">|</span>
                                <a href="tel:+255769324445" className="hover:text-zinc-800 transition-colors font-medium text-zinc-700">+255 769 324 445</a>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
                            <a href="mailto:info@stephanspetstore.co.tz" className="hover:text-zinc-800 transition-colors font-medium text-zinc-700">info@stephanspetstore.co.tz</a>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <Clock className="h-4 w-4 text-zinc-400 shrink-0" />
                            <span className="font-medium text-zinc-700">Mon-Sat: 9AM - 8:30PM</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
