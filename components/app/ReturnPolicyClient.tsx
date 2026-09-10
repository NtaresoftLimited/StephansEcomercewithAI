"use client";

import { useState } from "react";
import { ArrowRight, Package, Clock, ArrowRightLeft, Receipt, MessageCircle, Plus, Minus, Phone, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import Link from "next/link";

const POLICIES = [
    {
        id: "eligible",
        title: "Eligible items",
        subtitle: "Defective · Expired · Incorrect item",
        icon: Package,
        content: "An item may qualify for exchange if it is defective, expired at the time it was sold or delivered, or if you received a different item from the one you purchased or ordered.\n\nPlease contact us as soon as you notice the issue. Our team may ask to inspect the item, packaging, batch or expiry information, or photos before confirming the exchange.\n\n• Defective or damaged product not caused by misuse after purchase.\n• Product that was already expired when sold or delivered.\n• Incorrect item supplied or delivered by Stephan's Pet Store."
    },
    {
        id: "time",
        title: "24-hour window",
        subtitle: "Requests within 24 hours of purchase",
        icon: Clock,
        content: "For in-store purchases, please notify us of an exchange request within 24 hours of purchase. For delivered orders, please notify us within 24 hours of delivery.\n\nThe 24-hour window applies to notifying us of the problem. Once your request has been recorded, our team will advise you on when and where the item should be brought or returned for inspection."
    },
    {
        id: "exchange",
        title: "Exchange only",
        subtitle: "No cash refunds",
        icon: ArrowRightLeft,
        content: "If your request is approved, we will exchange the item for the same product where stock is available.\n\nIf the same product is unavailable, our team will discuss an appropriate replacement option with you. We do not provide cash refunds for items accepted under this exchange policy, except where a refund is required by applicable law or where Stephan's Pet Store cancels a paid order before fulfilment."
    },
    {
        id: "receipt",
        title: "Original receipt",
        subtitle: "Required for all exchange requests",
        icon: Receipt,
        content: "Please provide the original store receipt when requesting an exchange. For online or delivered orders, a valid digital order confirmation, invoice or order number may be used as proof of purchase.\n\nWithout proof that the item was purchased from Stephan's Pet Store, we may be unable to approve the exchange."
    }
];

export function ReturnPolicyClient() {
    const [selectedPolicy, setSelectedPolicy] = useState<typeof POLICIES[0] | null>(null);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#faf8f5] text-zinc-900 font-sans pb-24 pt-24 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <p className="text-[11px] font-bold tracking-[0.2em] text-[#7a6458] uppercase mb-8 flex items-center justify-center gap-4">
                        RETURNS & EXCHANGES
                    </p>
                    <div className="w-12 h-px bg-[#d8d2cb] mx-auto mb-8"></div>
                    <h1 className="text-4xl md:text-5xl text-[#1a1818] font-serif tracking-tight">
                        If something isn't right.
                    </h1>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
                    {POLICIES.map((policy) => {
                        const Icon = policy.icon;
                        return (
                            <div 
                                key={policy.id}
                                className="bg-[#fcfaf8] border border-[#eeebe5] rounded-3xl p-10 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer group"
                                onClick={() => setSelectedPolicy(policy)}
                            >
                                <div className="w-20 h-20 bg-[#f2ede7] rounded-full flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                                    <Icon className="w-8 h-8 text-[#4a3f39]" strokeWidth={1} />
                                </div>
                                <h2 className="text-2xl font-serif text-[#1a1818] mb-2 leading-[1.2]">
                                    {policy.title}
                                </h2>
                                <p className="text-sm text-[#7a6458] mb-8">
                                    {policy.subtitle}
                                </p>
                                <button className="mt-auto text-sm font-bold tracking-[0.1em] text-[#4a3f39] uppercase flex items-center gap-2 group-hover:text-[#7a6458] transition-colors">
                                    Read <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Accordion */}
                <div className="max-w-3xl mx-auto mb-16">
                    <div 
                        className="bg-[#fcfaf8] border border-[#eeebe5] rounded-2xl cursor-pointer hover:shadow-sm transition-shadow overflow-hidden"
                        onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                    >
                        <div className="flex items-center justify-between p-6 md:px-8">
                            <span className="text-[11px] font-bold tracking-[0.15em] text-[#1a1818] uppercase">
                                WHEN AN ITEM CAN'T BE EXCHANGED
                            </span>
                            {isAccordionOpen ? (
                                <Minus className="w-5 h-5 text-[#4a3f39]" strokeWidth={1} />
                            ) : (
                                <Plus className="w-5 h-5 text-[#4a3f39]" strokeWidth={1} />
                            )}
                        </div>
                        
                        <div className={"transition-all duration-300 ease-in-out "}>
                            <div className="p-6 md:px-8 pt-0 text-sm text-[#4a3f39] leading-relaxed border-t border-[#eeebe5]/50">
                                <p className="mb-4">An exchange may be declined where the issue is unrelated to a product defect, expiry or an error by Stephan's Pet Store.</p>
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <span className="shrink-0">•</span>
                                        <span>The request is made outside the stated 24-hour notification window.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="shrink-0">•</span>
                                        <span>No receipt, order confirmation or other valid proof of purchase is available.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="shrink-0">•</span>
                                        <span>The item was purchased correctly but the customer later changed their mind.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="shrink-0">•</span>
                                        <span>The wrong size, colour, flavour, variety or product was selected by the customer.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="shrink-0">•</span>
                                        <span>Food, treats, supplements or hygiene-sensitive products have been opened or used, unless the exchange request relates to a defect, expiry or an incorrect item supplied.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="shrink-0">•</span>
                                        <span>The product has been damaged, altered, stored incorrectly or misused after purchase or delivery.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="max-w-3xl mx-auto text-center border-t border-[#eeebe5] pt-16">
                    <div className="w-16 h-16 bg-[#f2ede7] rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageCircle className="w-6 h-6 text-[#4a3f39]" strokeWidth={1} />
                    </div>
                    <h2 className="text-3xl font-serif text-[#1a1818] mb-4">
                        Need help with an exchange?
                    </h2>
                    <p className="text-[#4a3f39] mb-10">
                        Contact us with your order details and proof of purchase.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a 
                            href="tel:+255786627873"
                            className="inline-flex items-center justify-center gap-3 border border-[#d8d2cb] rounded-full px-8 py-3 text-xs font-bold tracking-[0.15em] text-[#1a1818] uppercase hover:bg-[#f2ede7] transition-colors"
                        >
                            <Phone className="w-4 h-4" strokeWidth={1} />
                            CALL US <ArrowRight className="w-4 h-4 ml-2" />
                        </a>
                        <Link 
                            href="/contact"
                            className="inline-flex items-center justify-center gap-3 border border-[#d8d2cb] rounded-full px-8 py-3 text-xs font-bold tracking-[0.15em] text-[#1a1818] uppercase hover:bg-[#f2ede7] transition-colors"
                        >
                            <Mail className="w-4 h-4" strokeWidth={1} />
                            CONTACT US <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Dialog */}
            <Dialog open={!!selectedPolicy} onOpenChange={(open) => !open && setSelectedPolicy(null)}>
                <DialogContent className="sm:max-w-md bg-[#faf8f5] p-8 border-[#eeebe5] rounded-3xl shadow-xl max-h-[90vh] overflow-y-auto">
                    <DialogTitle className="text-2xl font-serif text-[#1a1818] mb-4 text-center whitespace-pre-line">
                        {selectedPolicy?.title}
                    </DialogTitle>
                    <div className="w-8 h-px bg-[#d8d2cb] mx-auto mb-6"></div>
                    <div className="text-[#3a3532] space-y-4 text-center leading-relaxed text-sm">
                        {selectedPolicy?.content.split('\n\n').map((paragraph, i) => (
                            <p key={i} className={paragraph.startsWith('•') ? 'text-left pl-4' : ''}>
                                {paragraph.split('\n').map((line, j) => (
                                    <span key={j}>
                                        {line}
                                        {j !== paragraph.split('\n').length - 1 && <br />}
                                    </span>
                                ))}
                            </p>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-center">
                        <DialogClose asChild>
                            <button className="bg-[#4a3f39] hover:bg-[#3a3532] text-white px-8 py-3 rounded-full text-xs font-bold tracking-wider uppercase transition-colors">
                                Close
                            </button>
                        </DialogClose>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
