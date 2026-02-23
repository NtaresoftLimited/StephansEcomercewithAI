"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

export function PointsAnimation({ points }: { points: number }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Delay slightly to appear after page load
        const timer1 = setTimeout(() => setVisible(true), 500);
        // Hide after animation completes
        const timer2 = setTimeout(() => setVisible(false), 4500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed bottom-24 right-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-700 pointer-events-none">
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 text-yellow-800 px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-bounce">
                <div className="bg-yellow-100 p-1.5 rounded-full">
                    <Star className="h-5 w-5 fill-yellow-500 text-yellow-600 animate-[spin_3s_linear_infinite]" />
                </div>
                <div className="flex flex-col leading-none">
                    <span className="font-bold text-lg text-yellow-900 drop-shadow-sm">+{points} PTS</span>
                    <span className="text-[10px] text-yellow-700 font-medium uppercase tracking-wider">Earned!</span>
                </div>
            </div>

            {/* Confetti-like particles (CSS only) */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping absolute top-0 left-0" style={{ animationDelay: "0.1s" }} />
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping absolute top-2 -left-4" style={{ animationDelay: "0.3s" }} />
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-ping absolute top-2 left-4" style={{ animationDelay: "0.5s" }} />
            </div>
        </div>
    );
}
