import { Metadata } from "next";
import { GroomingHero } from "@/components/app/grooming/GroomingHero";
import { GroomingPackages } from "@/components/app/grooming/GroomingPackages";
import { GroomingPolicy } from "@/components/app/grooming/GroomingPolicy";
import { GroomingBookingForm } from "@/components/app/grooming/GroomingBookingForm";
import { fetchGroomingPrices } from "@/lib/odoo/pricing";
import { PRICES as FALLBACK_PRICES } from "@/lib/constants/grooming";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "Pet Grooming Services | Stephan's Pet Store",
    description: "Professional grooming services for dogs and cats. Standard, Premium, and Super Premium packages available.",
};

export default async function GroomingPage() {
    let prices = FALLBACK_PRICES;
    try {
        const odooPrices = await fetchGroomingPrices();
        if (odooPrices && Object.keys(odooPrices).length > 0) {
            prices = odooPrices;
        }
    } catch (e) {
        console.warn("Using fallback prices due to Odoo error", e);
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f5ebe0] to-white dark:from-zinc-900 dark:to-zinc-950">
            <GroomingHero />
            <GroomingBookingForm prices={prices} />
            <GroomingPackages prices={prices} />
            <GroomingPolicy />
        </div>
    );
}
