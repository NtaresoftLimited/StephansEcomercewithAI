"use client";

import dynamic from "next/dynamic";
import { ArrowRight, MapPin, Plus } from "lucide-react";

// Dynamically import the StoreLocator component to avoid SSR issues with Leaflet
const StoreLocator = dynamic(
    () => import("@/components/app/StoreLocator").then((mod) => mod.StoreLocator),
    {
        ssr: false,
        loading: () => (
            <div className="h-[500px] w-full bg-[#f4f1eb] animate-pulse rounded-3xl flex items-center justify-center">
                <div className="text-zinc-400">Loading Map...</div>
            </div>
        ),
    }
);

export default function StoresPage() {
    return (
        <main className="min-h-screen bg-[#faf8f5] text-zinc-900 font-sans pb-24">
            <div className="mx-auto max-w-5xl px-4 pt-24 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <p className="text-[11px] font-bold tracking-[0.2em] text-[#7a6458] uppercase mb-6 flex items-center justify-center gap-4">
                        <span className="w-8 h-[1px] bg-[#d3cec4]"></span>
                        Store Locator
                        <span className="w-8 h-[1px] bg-[#d3cec4]"></span>
                    </p>
                    <h1 className="text-5xl md:text-[3.5rem] text-zinc-900 font-serif tracking-tight">
                        Find us in Dar es Salaam.
                    </h1>
                </div>

                {/* Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
                    {/* Masaki Card */}
                    <div className="bg-[#fcfaf8] border border-[#eeebe5] rounded-[2rem] p-12 flex flex-col items-center text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow">
                        <div className="w-14 h-14 bg-[#f2ede7] rounded-full flex items-center justify-center mb-8">
                            <MapPin className="w-6 h-6 text-[#4a3f39]" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-[1.75rem] font-serif mb-2 text-[#1a1818]">MASAKI</h2>
                        <p className="text-sm font-medium text-[#7a6458] mb-8">Main Store</p>
                        
                        <p className="text-[15px] text-[#3a3532] mb-1">11 Slipway Rd, Masaki</p>
                        <p className="text-[15px] text-[#3a3532] mb-10">Dar es Salaam</p>

                        <div className="w-full border-t border-[#eeebe5] mb-8"></div>

                        <a 
                            href="https://www.google.com/maps/dir/?api=1&destination=-6.7452,39.2825" 
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[13px] font-bold tracking-[0.1em] text-[#4a3f39] hover:text-[#7a6458] uppercase mb-6 transition-colors"
                        >
                            GET DIRECTIONS <ArrowRight className="w-4 h-4 ml-1" />
                        </a>
                        <button className="flex items-center gap-2 text-[14px] font-medium text-[#5a524e] hover:text-[#1a1818] transition-colors">
                            Store details <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Mikocheni Card */}
                    <div className="bg-[#fcfaf8] border border-[#eeebe5] rounded-[2rem] p-12 flex flex-col items-center text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow">
                        <div className="w-14 h-14 bg-[#f2ede7] rounded-full flex items-center justify-center mb-8">
                            <MapPin className="w-6 h-6 text-[#4a3f39]" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-[1.75rem] font-serif mb-2 text-[#1a1818]">MIKOCHENI</h2>
                        <div className="h-[20px] mb-8"></div> {/* Spacer to match Masaki's "Main Store" */}
                        
                        <p className="text-[15px] text-[#3a3532] mb-1">58 Mikocheni A</p>
                        <p className="text-[15px] text-[#3a3532] mb-10">Dar es Salaam</p>

                        <div className="w-full border-t border-[#eeebe5] mb-8"></div>

                        <a 
                            href="https://www.google.com/maps/dir/?api=1&destination=-6.7733,39.2699" 
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[13px] font-bold tracking-[0.1em] text-[#4a3f39] hover:text-[#7a6458] uppercase mb-6 transition-colors"
                        >
                            GET DIRECTIONS <ArrowRight className="w-4 h-4 ml-1" />
                        </a>
                        <button className="flex items-center gap-2 text-[14px] font-medium text-[#5a524e] hover:text-[#1a1818] transition-colors">
                            Store details <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Map Section */}
                <div className="text-center mb-10">
                    <h2 className="text-[2rem] font-serif text-[#1a1818]">Our locations</h2>
                </div>

                <div className="w-full h-[450px] rounded-[1.5rem] overflow-hidden shadow-sm border border-[#eeebe5]">
                    <StoreLocator />
                </div>
            </div>
        </main>
    );
}
