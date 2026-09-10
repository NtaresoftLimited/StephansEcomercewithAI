import { ReturnPolicyClient } from "@/components/app/ReturnPolicyClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Returns & Exchanges | Stephan's Pet Store",
    description: "Our return and exchange policy for defective or incorrect items.",
};

export default function ReturnPolicyPage() {
    return <ReturnPolicyClient />;
}
