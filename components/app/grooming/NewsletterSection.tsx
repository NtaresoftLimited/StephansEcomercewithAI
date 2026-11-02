import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { NewsletterForm } from "./NewsletterForm";

export function NewsletterSection() {
    return (
        <section className="pb-16 pt-8 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Newsletter Box */}
                <div className="bg-[#F6F4F1] rounded-3xl overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 md:p-16">
                    <div className="w-full md:w-1/2 max-w-md relative z-10">
                        <h3 className="text-[11px] font-bold tracking-[0.15em] text-[#c77e35] uppercase mb-4">
                            STAY IN THE KNOW
                        </h3>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#222] mb-6 leading-tight">
                            From Stephan's, occasionally.
                        </h2>
                        <p className="text-base text-[#444] mb-8 leading-relaxed">
                            A considered note on what's new,<br />what's special, and what's worth knowing.
                        </p>
                        
                        <NewsletterForm />
                        
                        <a href="https://wa.me/255769324445" className="inline-flex items-center gap-2 text-sm text-[#222] hover:text-[#c77e35] transition-colors font-medium">
                            <Image src="/whatsapp-color.svg" alt="WhatsApp" width={24} height={24} className="w-6 h-6" />
                            Prefer WhatsApp? Talk to us <ArrowRight className="w-4 h-4 ml-1 text-zinc-400" />
                        </a>
                    </div>
                    
                    <div className="hidden md:block w-1/2 relative h-[350px] lg:h-[400px]">
                        <Image 
                            src="/newsletter-toys.webp" 
                            alt="Pet Toys" 
                            fill 
                            className="object-contain object-center md:object-right "
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
