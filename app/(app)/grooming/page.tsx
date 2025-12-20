import { Metadata } from "next";
import { GroomingHero } from "@/components/app/grooming/GroomingHero";
import { GroomingPackages } from "@/components/app/grooming/GroomingPackages";
import { GroomingPolicy } from "@/components/app/grooming/GroomingPolicy";
import { GroomingBookingForm } from "@/components/app/grooming/GroomingBookingForm";

export const metadata: Metadata = {
    title: "Pet Grooming Services | Stephan's Pet Store",
    description: "Professional grooming services for dogs and cats. Standard, Premium, and Super Premium packages available.",
};

export default function GroomingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f5ebe0] to-white dark:from-zinc-900 dark:to-zinc-950">
            <GroomingHero />
            <GroomingBookingForm />
            <GroomingPackages />
            <GroomingPolicy />
        </div>
    );
}
