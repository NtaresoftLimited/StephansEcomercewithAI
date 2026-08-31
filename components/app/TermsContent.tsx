"use client";

import { useState } from "react";
import { Plus, Minus, ShoppingBag, Truck, Package, Scissors, Shield, FileText, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

const TERMS_SECTIONS = [
    {
        id: "shopping",
        icon: ShoppingBag,
        title: "Shopping with Stephan's",
        subtitle: "Products, availability, pricing and payment.",
        content: "All products and services are subject to availability. We reserve the right to limit quantities of products available for purchase, discontinue any product or service at any time, modify product descriptions and pricing without notice, and refuse orders that appear fraudulent or violate our policies. All prices are listed in Tanzanian Shillings (TZS) unless otherwise stated.",
        link: null,
    },
    {
        id: "delivery",
        icon: Truck,
        title: "Delivery",
        subtitle: "Delivery areas, fees and estimated times.",
        content: "We offer delivery services within Dar es Salaam and selected areas in Tanzania. Delivery fees apply for orders below the minimum amount. Delivery times are estimates and not guaranteed. We are not responsible for delays caused by factors beyond our control.",
        link: null,
    },
    {
        id: "returns",
        icon: Package,
        title: "Returns & Exchanges",
        subtitle: "Eligibility, time limits and how exchanges work.",
        content: "Products must be returned within 7 days of delivery. Items must be in original, unopened packaging. Perishable items and opened food cannot be returned. Refunds are processed within 7-14 business days.",
        link: { text: "View Return Policy", href: "/return-policy" },
    },
    {
        id: "grooming",
        icon: Scissors,
        title: "Grooming Services",
        subtitle: "Appointments, pet wellbeing, handling and collection.",
        content: "Appointments must be booked in advance. Cancellations must be made at least 24 hours before the appointment. We reserve the right to refuse service if a pet shows signs of aggression or illness. Pet owners are responsible for informing us of any health conditions or special requirements.",
        link: { text: "View Grooming Policy", href: "/grooming" },
    },
    {
        id: "privacy",
        icon: Shield,
        title: "Privacy",
        subtitle: "How we collect, use and protect your information.",
        content: "We are committed to protecting your privacy and personal information. We collect only necessary information for order processing. Your personal data is stored securely and never sold to third parties. We use cookies to improve your browsing experience. You have the right to request access to or deletion of your personal data.",
        link: null,
    },
    {
        id: "other",
        icon: FileText,
        title: "Other Terms",
        subtitle: "Liability, changes to these terms and other important information.",
        content: "Stephan's Pet Store shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or services. We reserve the right to modify these terms and conditions at any time. Changes will be effective immediately upon posting to our website. Your continued use of our services after changes are posted constitutes acceptance of the modified terms.",
        link: null,
    },
];

export function TermsContent() {
    const [openSection, setOpenSection] = useState<string | null>(null);

    const toggleSection = (id: string) => {
        setOpenSection(openSection === id ? null : id);
    };

    return (
        <div className="w-full">
            <div className="bg-[#fcfaf8] border border-[#eeebe5] rounded-[2rem] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                {TERMS_SECTIONS.map((section, index) => {
                    const Icon = section.icon;
                    const isOpen = openSection === section.id;
                    const isLast = index === TERMS_SECTIONS.length - 1;

                    return (
                        <div key={section.id} className={`${!isLast ? 'border-b border-[#eeebe5]' : ''}`}>
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full text-left px-8 py-10 flex items-start gap-8 hover:bg-[#f8f5f1] transition-colors"
                            >
                                <div className="w-[4.5rem] h-[4.5rem] bg-[#f2ede7] rounded-full flex items-center justify-center shrink-0">
                                    <Icon className="w-7 h-7 text-[#4a3f39]" strokeWidth={1.5} />
                                </div>
                                <div className="flex-1 mt-1">
                                    <h2 className="text-[1.75rem] font-serif text-[#1a1818] mb-2">{section.title}</h2>
                                    <p className="text-[15px] font-medium text-[#5a524e] leading-snug">{section.subtitle}</p>
                                    
                                    {section.link && (
                                        <div className="mt-5" onClick={(e) => e.stopPropagation()}>
                                            <Link href={section.link.href} className="inline-flex items-center gap-2 text-[14px] font-bold tracking-wide text-[#4a3f39] hover:text-[#7a6458] transition-colors">
                                                {section.link.text} <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3 text-[#4a3f39]">
                                    {isOpen ? <Minus className="w-6 h-6" strokeWidth={1.5} /> : <Plus className="w-6 h-6" strokeWidth={1.5} />}
                                </div>
                            </button>
                            {isOpen && (
                                <div className="px-8 pb-10 pl-[8.5rem] pr-[4rem]">
                                    <p className="text-[#3a3532] text-[15px] leading-relaxed">{section.content}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-16 flex justify-center pb-8">
                <Link href="/contact" className="inline-flex items-center gap-3 text-[#3a3532] hover:text-[#1a1818] transition-colors">
                    <MessageCircle className="w-[22px] h-[22px] text-[#5a524e]" strokeWidth={1.5} />
                    <span className="text-[16px] font-medium ml-2">Questions about these terms?</span>
                    <span className="text-[16px] font-bold flex items-center gap-1">Contact us <ArrowRight className="w-4 h-4" /></span>
                </Link>
            </div>
        </div>
    );
}
