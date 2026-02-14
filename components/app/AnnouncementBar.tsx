"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ANNOUNCEMENTS = [
    {
        id: 1,
        text: "Free Delivery in Dar es Salaam on orders over 100,000 TZS",
        link: "/products",
    },
    {
        id: 2,
        text: "New Premium Dog Food Arrivals - Shop Now",
        link: "/products?category=dog-food",
    },
    {
        id: 3,
        text: "Expert Grooming Services Available - Book Today",
        link: "/grooming",
    },
];

export function AnnouncementBar() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
                setIsVisible(true);
            }, 500); // Wait for fade out
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    const announcement = ANNOUNCEMENTS[currentIndex];

    return (
        <div className="bg-[#6b3e1e] text-white h-10 relative flex items-center justify-center z-[60] overflow-hidden">
            <div
                className={cn(
                    "w-full text-center px-4 transition-all duration-500 ease-in-out transform",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                )}
            >
                <Link
                    href={announcement.link}
                    className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-medium hover:text-white/80 transition-colors tracking-widest uppercase"
                >
                    {announcement.text}
                    <ChevronRight className="w-3 h-3" strokeWidth={3} />
                </Link>
            </div>
        </div>
    );
}
