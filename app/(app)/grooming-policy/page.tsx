import { Metadata } from "next";
import { GroomingPolicyClient } from "@/components/app/GroomingPolicyClient";

export const metadata: Metadata = {
    title: "Grooming Policy",
    description: "Read Stephan's Grooming Studio policies for private appointments, pre-visit, grooming procedures, and pick-up.",
};

export default function GroomingPolicyPage() {
    return <GroomingPolicyClient />;
}
