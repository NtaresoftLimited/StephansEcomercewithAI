import { Metadata } from 'next';
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary";

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

                <div className="mt-6 text-center text-xs text-zinc-400 max-w-xs mx-auto">
                    <p className="mb-2">Need help? Call us at <a href="tel:+255745222222" className="underline hover:text-zinc-600">+255 745 222 222</a></p>
                    <p>Mon - Sat: 9:00 AM - 7:00 PM</p>
                </div>
            </div>
        </div>
    );
}
