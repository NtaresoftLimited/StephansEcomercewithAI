"use client";

import { useState } from "react";
import { ArrowRight, Home, Calendar, Scissors, Clock, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";

const POLICIES = [
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
        content: "Every pet and every coat is different. If we find matting or tangles, we may recommend additional de-matting, a shorter trim or other care where necessary to keep your pet comfortable.\n\nSome pets may need a little more patience or support during grooming. Additional handling may be recommended where necessary. If your pet becomes too stressed or grooming becomes unsafe, we may gently adjust, pause or stop the service.\n\nYour pet’s wellbeing always comes first. If we notice anything during grooming that we feel you should know about, we’ll let you know and may recommend veterinary attention where appropriate.\n\nIf fleas or ticks are found during grooming, we may recommend appropriate treatment.\n\nDe-matting, additional handling, sedation or other care may carry an additional fee when required. Where possible, we’ll discuss this with you first."
    },
    {
        id: "ready",
        title: "When they're\nready.",
        icon: Clock,
        content: "Once your pet is ready, we’ll let you know.\n\nWe kindly ask that pets are collected within one hour of notification. A late pickup fee may apply when collection is delayed beyond this window."
    }
];

export function GroomingPolicyClient() {
    const [selectedPolicy, setSelectedPolicy] = useState<typeof POLICIES[0] | null>(null);

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
                <DialogContent className="sm:max-w-md bg-[#faf8f5] p-8 border-[#eeebe5] rounded-3xl shadow-xl">
                    <DialogTitle className="text-2xl font-serif text-[#1a1818] mb-4 text-center whitespace-pre-line">
                        {selectedPolicy?.title.replace('\n', ' ')}
                    </DialogTitle>
                    <div className="w-8 h-px bg-[#d8d2cb] mx-auto mb-6"></div>
                    <div className="text-[#3a3532] space-y-4 text-center leading-relaxed">
                        {selectedPolicy?.content.split('\n\n').map((paragraph, i) => (
                            <p key={i}>{paragraph}</p>
                        ))}
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
