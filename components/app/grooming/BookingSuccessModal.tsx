"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Check, Calendar, Clock, MapPin, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface BookingSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingDetails: {
        petName: string;
        package: string;
        date: string;
        time: string;
        price: number;
    };
}

export function BookingSuccessModal({ isOpen, onClose, bookingDetails }: BookingSuccessModalProps) {
    const [hasFired, setHasFired] = useState(false);

    useEffect(() => {
        if (isOpen && !hasFired) {
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                // since particles fall down, start a bit higher than random
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                });
            }, 250);

            setHasFired(true);
            return () => clearInterval(interval);
        }
        if (!isOpen) {
            setHasFired(false);
        }
    }, [isOpen, hasFired]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl animate-in zoom-in duration-300">
                <div className="bg-gradient-to-br from-[#6b3e1e] to-[#8b5a2b] p-8 text-center text-white relative">
                    <button 
                        onClick={onClose}
                        className="absolute right-4 top-4 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Check className="h-10 w-10 text-white stroke-[3px]" />
                    </div>
                    
                    <DialogTitle className="text-3xl font-bold mb-2">Booking Confirmed!</DialogTitle>
                    <DialogDescription className="text-white/80 text-lg">
                        We're excited to see {bookingDetails.petName} soon!
                    </DialogDescription>
                </div>

                <div className="p-8 bg-white dark:bg-zinc-900 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                            <Calendar className="h-5 w-5 text-[#6b3e1e] shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Date</p>
                                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{bookingDetails.date}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                            <Clock className="h-5 w-5 text-[#6b3e1e] shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Time</p>
                                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{bookingDetails.time}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800 pb-3">
                            <span className="text-zinc-500">Service Package</span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 capitalize">{bookingDetails.package.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-500">Total Price</span>
                            <span className="text-lg font-bold text-[#6b3e1e]">{formatPrice(bookingDetails.price)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <Button 
                            onClick={onClose}
                            className="w-full h-12 rounded-xl bg-[#6b3e1e] hover:bg-[#5a3419] text-white font-bold"
                        >
                            Done
                        </Button>
                        <p className="text-center text-xs text-zinc-400">
                            A confirmation email has been sent to you.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
