import { Metadata } from 'next';
import Link from "next/link";
import { CheckCircle, ShoppingBag } from "lucide-react";
import { OrderTracker } from "@/components/app/OrderTracker";
import { PointsAnimation } from "@/components/app/PointsAnimation";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: 'Order Confirmation | Stephan\'s Pet Store',
    description: 'Thank you for your order!',
};

export default function OrderConfirmationPage() {
    // In a real app, fetch order details via ID from URL search params
    const mockOrder = {
        id: "ORD-" + Math.floor(Math.random() * 100000),
        status: "pending" as const,
        total: 125000,
        pointsEarned: 1250 // 1 point per 100 TSh maybe?
    };

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 bg-zinc-50">
            <PointsAnimation points={mockOrder.pointsEarned} />

            <div className="max-w-3xl mx-auto space-y-8">

                {/* Success Header */}
                <div className="text-center space-y-4 animate-in zoom-in-95 duration-700">
                    <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full mb-4 ring-8 ring-green-50">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-zinc-900 tracking-tight">Thank you!</h1>
                    <p className="text-zinc-500 text-lg">Your order <span className="font-bold text-zinc-900">#{mockOrder.id}</span> has been placed.</p>
                    <p className="text-sm text-zinc-400 max-w-md mx-auto">
                        We've sent a confirmation email to your inbox. We'll notify you when your items ship.
                    </p>
                </div>

                {/* Order Tracker */}
                <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
                    <OrderTracker status={mockOrder.status} estimatedDelivery="Tomorrow, 2:00 PM" />
                </div>

                {/* Actions */}
                <div className="max-w-xs mx-auto space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-500">
                    <Link href="/orders">
                        <Button variant="outline" className="w-full h-12 border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-medium">
                            View Order Details
                        </Button>
                    </Link>
                    <Link href="/products">
                        <Button className="w-full h-12 bg-[#6b3e1e] hover:bg-[#5a3419] text-white font-bold uppercase tracking-wider shadow-md">
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            Continue Shopping
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
