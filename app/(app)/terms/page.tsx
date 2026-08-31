import { Metadata } from "next";
import { TermsContent } from "@/components/app/TermsContent";

export const metadata: Metadata = {
    title: "Terms & Conditions",
    description: "Read our terms and conditions for using Stephan's Pet Store services and purchasing products.",
};

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-[#faf8f5] text-zinc-900 font-sans pb-24">
            <div className="mx-auto max-w-[56rem] px-4 pt-24 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <p className="text-[11px] font-bold tracking-[0.2em] text-[#7a6458] uppercase mb-6 flex items-center justify-center gap-4">
                        TERMS & CONDITIONS
                    </p>
                    <h1 className="text-5xl md:text-[4rem] text-zinc-900 font-serif tracking-tight mb-6">
                        Terms & Conditions
                    </h1>
                    <p className="text-[15px] text-[#5a524e] font-medium">
                        Last updated: August 2026
                    </p>
                </div>

                {/* Interactive Accordion Content */}
                <TermsContent />
            </div>
        </main>
    );
}
