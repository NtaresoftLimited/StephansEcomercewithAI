"use client";

import { Scissors } from "lucide-react";

export function GroomingHero() {
    return (
        <section className="relative overflow-hidden py-20 px-4 bg-gradient-to-b from-[#6b3e1e]/10 to-transparent">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236b3e1e' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            <div className="relative mx-auto max-w-4xl text-center">
                <div className="mb-6 flex justify-center">
                    <div className="rounded-full bg-gradient-to-r from-[#6b3e1e] to-[#8b5a2b] p-4">
                        <Scissors className="h-12 w-12 text-white" />
                    </div>
                </div>

                <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl md:text-6xl">
                    Pet Grooming{" "}
                    <span className="bg-gradient-to-r from-[#6b3e1e] to-[#8b5a2b] bg-clip-text text-transparent">
                        Services
                    </span>
                </h1>

                <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
                    Professional grooming for your furry friends. Our experienced groomers
                    provide top-quality care with love and attention to detail.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <a
                        href="#booking"
                        className="rounded-full bg-gradient-to-r from-[#6b3e1e] to-[#8b5a2b] px-8 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                    >
                        Book Appointment
                    </a>
                    <a
                        href="#packages"
                        className="rounded-full border-2 border-[#6b3e1e] px-8 py-3 font-semibold text-[#6b3e1e] transition-all hover:bg-[#6b3e1e]/10"
                    >
                        View Packages
                    </a>
                </div>
            </div>
        </section>
    );
}
