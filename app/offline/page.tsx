"use client";

import Link from "next/link";
import { WifiOff, Home, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f5ebe0] to-white flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#6b3e1e]/10 blur-3xl rounded-full" />
                        <div className="relative bg-white rounded-full p-8 shadow-xl border-4 border-[#6b3e1e]/20">
                            <WifiOff className="h-20 w-20 text-[#6b3e1e]" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-zinc-900 mb-3">
                    You're Offline
                </h1>

                <p className="text-zinc-600 mb-8 leading-relaxed">
                    It looks like you don't have an internet connection right now.
                    Some features may be limited until you're back online.
                </p>

                <div className="space-y-3">
                    <Button
                        onClick={() => window.location.reload()}
                        className="w-full bg-[#6b3e1e] hover:bg-[#5a3419] text-white py-6 rounded-xl font-semibold flex items-center justify-center gap-2"
                    >
                        <RefreshCcw className="h-5 w-5" />
                        Try Again
                    </Button>

                    <Link href="/" className="block">
                        <Button
                            variant="outline"
                            className="w-full py-6 rounded-xl font-semibold flex items-center justify-center gap-2 border-[#6b3e1e]/20 text-[#6b3e1e] hover:bg-[#6b3e1e]/5"
                        >
                            <Home className="h-5 w-5" />
                            Go to Homepage
                        </Button>
                    </Link>
                </div>

                <div className="mt-12 p-6 bg-amber-50 rounded-xl border border-amber-200">
                    <h3 className="font-semibold text-zinc-900 mb-2 flex items-center justify-center gap-2">
                        <span className="text-amber-600">💡</span> Tip
                    </h3>
                    <p className="text-sm text-zinc-600">
                        When offline, you can still browse previously visited pages and products
                        that have been cached on your device.
                    </p>
                </div>
            </div>
        </div>
    );
}
