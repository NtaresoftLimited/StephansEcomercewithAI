"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function NewsletterSection() {
    return (
        <section className="pb-16 pt-8 bg-[#F8F5F0]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Newsletter Box */}
                <div className="bg-[#F3EFE9] rounded-3xl overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 md:p-16">
                    <div className="w-full md:w-1/2 max-w-md relative z-10">
                        <h3 className="text-[11px] font-bold tracking-[0.15em] text-[#A66C44] uppercase mb-4">
                            STAY IN THE KNOW
                        </h3>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#222] mb-6 leading-tight">
                            From Stephan's, occasionally.
                        </h2>
                        <p className="text-base text-[#444] mb-8 leading-relaxed">
                            A considered note on what's new,<br />what's special, and what's worth knowing.
                        </p>
                        
                        <form className="flex flex-col sm:flex-row gap-3 mb-6" onSubmit={(e) => e.preventDefault()}>
                            <input 
                                type="email" 
                                placeholder="Your email address" 
                                className="flex-1 rounded-xl border border-[#E8E0D8] px-5 py-4 focus:outline-none focus:ring-1 focus:ring-[#A66C44] bg-white text-sm shadow-sm"
                                required
                            />
                            <button 
                                type="submit" 
                                className="bg-[#A66C44] text-white px-8 py-4 rounded-xl text-sm font-bold tracking-wider hover:bg-[#8e5a36] transition-colors"
                            >
                                Subscribe
                            </button>
                        </form>
                        
                        <a href="https://wa.me/255769324445" className="inline-flex items-center gap-2 text-sm text-[#222] hover:text-[#A66C44] transition-colors font-medium">
                            <Image src="/whatsapp-color.svg" alt="WhatsApp" width={24} height={24} className="w-6 h-6" />
                            Prefer WhatsApp? Talk to us <ArrowRight className="w-4 h-4 ml-1 text-zinc-400" />
                        </a>
                    </div>
                    
                    <div className="hidden md:block w-1/2 relative h-[350px] lg:h-[400px]">
                        <Image 
                            src="/newsletter-toys.jpg" 
                            alt="Pet Toys" 
                            fill 
                            className="object-contain object-center md:object-right mix-blend-multiply drop-shadow-md"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
