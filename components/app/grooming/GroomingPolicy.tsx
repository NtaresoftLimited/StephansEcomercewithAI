"use client";

import { AlertTriangle, Clock, Heart } from "lucide-react";

export function GroomingPolicy() {
    return (
        <section className="py-16 px-4">
            <div className="mx-auto max-w-4xl">
                <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-white mb-8">
                    Important Grooming Policy
                </h2>

                <div className="rounded-2xl bg-gradient-to-br from-[#6b3e1e]/10 to-[#8b5a2b]/10 dark:from-zinc-800 dark:to-zinc-900 p-8 shadow-lg border border-[#6b3e1e]/20">
                    <div className="flex items-center gap-3 mb-6">
                        <Heart className="h-8 w-8 text-red-500" />
                        <p className="text-lg font-semibold text-zinc-800 dark:text-white">
                            At Stephan&apos;s Pet Store, your pet&apos;s well-being and the safety of our team are our top priorities.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Behavioral Handling */}
                        <div className="rounded-xl bg-white dark:bg-zinc-800 p-6 shadow-md border border-[#6b3e1e]/10">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="h-6 w-6 text-[#8b5a2b]" />
                                <h3 className="font-bold text-zinc-900 dark:text-white">
                                    Behavioral Handling & Sedation
                                </h3>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                                Pets showing anxiety or aggression may require extra care, time, or restraint—an
                                additional <strong className="text-[#6b3e1e]">handling fee of 20,000 TZS</strong> may apply. If needed, a mild sedative
                                may be recommended (with your consent and under veterinary supervision).
                            </p>
                        </div>

                        {/* Timely Pickup */}
                        <div className="rounded-xl bg-white dark:bg-zinc-800 p-6 shadow-md border border-[#6b3e1e]/10">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="h-6 w-6 text-[#6b3e1e]" />
                                <h3 className="font-bold text-zinc-900 dark:text-white">
                                    Timely Pickup Policy
                                </h3>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                                Once the grooming session is complete, we&apos;ll notify you. To maintain a calm and
                                stress-free environment for other pets, please pick up your pet within <strong className="text-[#6b3e1e]">1 hour
                                    of notification</strong>. A late pickup fee of <strong className="text-[#6b3e1e]">10,000 TZS per hour</strong> applies
                                if pickup is delayed beyond this window.
                            </p>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-zinc-600 dark:text-zinc-400 italic">
                        Thank you for your understanding. We look forward to pampering your fur baby! 🐾
                    </p>
                </div>
            </div>
        </section>
    );
}
