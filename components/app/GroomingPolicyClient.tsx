"use client";

import { useState } from "react";
import { ArrowRight, Home, Calendar, Scissors, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";

interface PolicyItem {
    id: string;
    title: string;
    icon: any;
    subtitle?: string;
    fees?: { service: string; fee: string }[];
    notice?: string;
    content: string;
    tagline?: string;
}

const POLICIES: PolicyItem[] = [
    {
        id: "private",
        title: "Private\nappointment.",
        icon: Home,
        content: "If you would prefer your pet to be groomed without other pets around, please let us know in advance when booking so we can arrange their appointment accordingly."
    },
    {
        id: "before",
        title: "Before\nyour visit.",
        icon: Calendar,
        content: "Please arrive around 10 minutes early so we have time to welcome your pet and complete check-in without rushing.\n\nPlease let our team know about any medical conditions, sensitivities, allergies, recent procedures, medications or special requirements before grooming begins."
    },
    {
        id: "during",
        title: "During\ntheir groom.",
        icon: Scissors,
        subtitle: "ADDITIONAL CARE & FEES",
        fees: [
            { service: "Moderate Detangling", fee: "TSh 100,000" },
            { service: "Intensive Detangling", fee: "TSh 150,000" },
            { service: "Handling Fee", fee: "TSh 50,000" },
            { service: "Sedation Fee", fee: "TSh 50,000" }
        ],
        notice: "Any additional care and fees will be discussed and agreed with you before proceeding.",
        content: "Every pet and every coat is different. Tangled or matted coats require extra time and careful attention. Our team will assess your pet’s coat and explain the level of care needed.\n\nSome pets need a little more patience or support during grooming. Additional handling may be recommended to keep your pet and our team safe. Where sedation is considered necessary, it requires veterinary assessment and administration.\n\nYour pet’s wellbeing always comes first. If your pet becomes too stressed or grooming becomes unsafe, we may gently adjust, pause or stop the service.\n\nIf we notice anything during grooming that you should know about, we’ll let you know and may recommend veterinary attention where appropriate.\n\nIf fleas or ticks are found during grooming, we may recommend appropriate treatment.",
        tagline: "“Your pet’s comfort. Our priority.”"
    },
    {
        id: "ready",
        title: "When they're\nready.",
        icon: Clock,
        content: "Once your pet is ready, we’ll let you know.\n\nWe kindly ask that pets are collected within one hour of notification. A late pickup fee may apply when collection is delayed beyond this window."
    }
];

export function GroomingPolicyClient() {
    const [selectedPolicy, setSelectedPolicy] = useState<PolicyItem | null>(null);

    return (
        <div className="min-h-screen bg-[#faf8f5] text-zinc-900 font-sans pb-24 pt-32 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <p className="text-[11px] font-bold tracking-[0.2em] text-[#7a6458] uppercase mb-8 flex items-center justify-center gap-4">
                        GROOMING POLICY
                    </p>
                    <div className="w-12 h-px bg-[#d8d2cb] mx-auto mb-8"></div>
                    <h1 className="text-4xl md:text-5xl text-[#1a1818] font-serif tracking-tight">
                        A comfortable visit starts here.
                    </h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {POLICIES.map((policy) => {
                        const Icon = policy.icon;
                        return (
                            <div 
                                key={policy.id}
                                className="bg-[#fcfaf8] border border-[#eeebe5] rounded-3xl p-10 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer group"
                                onClick={() => setSelectedPolicy(policy)}
                            >
                                <div className="w-20 h-20 bg-[#f2ede7] rounded-full flex items-center justify-center mb-8 group-hover:scale-105 transition-transform">
                                    <Icon className="w-8 h-8 text-[#4a3f39]" strokeWidth={1.5} />
                                </div>
                                <h2 className="text-3xl font-serif text-[#1a1818] mb-8 whitespace-pre-line leading-[1.2]">
                                    {policy.title}
                                </h2>
                                <button className="mt-auto text-sm font-bold tracking-[0.1em] text-[#4a3f39] uppercase flex items-center gap-2 group-hover:text-[#7a6458] transition-colors">
                                    Read <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Dialog open={!!selectedPolicy} onOpenChange={(open) => !open && setSelectedPolicy(null)}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-[#faf8f5] p-6 sm:p-8 border-[#eeebe5] rounded-3xl shadow-xl">
                    <div className={selectedPolicy?.fees ? "text-left" : "text-center"}>
                        <DialogTitle className="text-2xl font-serif text-[#1a1818] whitespace-pre-line">
                            {selectedPolicy?.title.replace('\n', ' ')}
                        </DialogTitle>
                        
                        {selectedPolicy?.subtitle && (
                            <div className="text-xs font-bold tracking-[0.15em] text-[#7a6458] uppercase mt-2 mb-4">
                                {selectedPolicy.subtitle}
                            </div>
                        )}

                        <div className={`w-12 h-px bg-[#d8d2cb] mb-6 ${selectedPolicy?.fees ? "" : "mx-auto"}`}></div>

                        {selectedPolicy?.fees && (
                            <div className="mb-6 rounded-2xl bg-white border border-[#eeebe5] overflow-hidden shadow-sm">
                                <div className="grid grid-cols-2 px-5 py-3 bg-[#f7f4ef] border-b border-[#eeebe5] text-xs font-bold uppercase tracking-wider text-[#7a6458]">
                                    <span>Service</span>
                                    <span className="text-right">Fee</span>
                                </div>
                                <div className="divide-y divide-[#eeebe5]">
                                    {selectedPolicy.fees.map((f, i) => (
                                        <div key={i} className="grid grid-cols-2 px-5 py-3.5 text-sm">
                                            <span className="font-medium text-[#2d2825]">{f.service}</span>
                                            <span className="font-semibold text-[#1a1818] text-right">{f.fee}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedPolicy?.notice && (
                            <div className="mb-6 p-4 rounded-xl bg-[#f5efe9] border border-[#e8dfd5] text-sm text-[#4a3f39] font-medium leading-relaxed">
                                {selectedPolicy.notice}
                            </div>
                        )}

                        <div className={`text-[#3a3532] space-y-4 leading-relaxed text-sm sm:text-base ${selectedPolicy?.fees ? "text-left" : "text-center"}`}>
                            {selectedPolicy?.content.split('\n\n').map((paragraph, i) => (
                                <p key={i}>{paragraph}</p>
                            ))}
                        </div>

                        {selectedPolicy?.tagline && (
                            <div className="mt-8 pt-6 border-t border-[#eeebe5] text-center font-serif italic text-lg sm:text-xl text-[#3a3532]">
                                {selectedPolicy.tagline}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex justify-center">
                        <DialogClose asChild>
                            <button className="bg-[#4a3f39] hover:bg-[#3a3532] text-white px-8 py-3 rounded-full text-sm font-bold tracking-wider uppercase transition-colors">
                                Close
                            </button>
                        </DialogClose>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}