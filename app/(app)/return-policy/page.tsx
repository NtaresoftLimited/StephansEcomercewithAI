import { ShieldCheck, ArrowLeftRight, Clock, Receipt } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ReturnPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="bg-[#6b3e1e] text-white py-16 px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Return Policy</h1>
                <p className="max-w-2xl mx-auto opacity-90 text-lg">
                    We want you to be completely satisfied with your purchase. Here's how we handle returns and exchanges.
                </p>
            </section>

            <section className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="grid gap-12">

                    {/* Eligibility Section */}
                    <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-[#6b3e1e]/10 flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6 text-[#6b3e1e]" />
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-900">Eligibility for Exchange</h2>
                        </div>
                        <p className="text-zinc-600 mb-6 font-medium">
                            We provide product replacement for the following conditions only:
                        </p>
                        <ul className="grid sm:grid-cols-2 gap-4">
                            <li className="flex items-center gap-3 bg-white p-4 rounded-xl border border-zinc-200">
                                <span className="w-2 h-2 rounded-full bg-[#6b3e1e]" />
                                <span className="text-zinc-700">Defective product</span>
                            </li>
                            <li className="flex items-center gap-3 bg-white p-4 rounded-xl border border-zinc-200">
                                <span className="w-2 h-2 rounded-full bg-[#6b3e1e]" />
                                <span className="text-zinc-700">Wrong item received</span>
                            </li>
                            <li className="flex items-center gap-3 bg-white p-4 rounded-xl border border-zinc-200">
                                <span className="w-2 h-2 rounded-full bg-[#6b3e1e]" />
                                <span className="text-zinc-700">Past its expiry date</span>
                            </li>
                        </ul>
                    </div>

                    {/* Key Conditions */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-2xl border border-zinc-200 text-center">
                            <div className="mx-auto w-10 h-10 rounded-full bg-[#6b3e1e]/5 flex items-center justify-center mb-4">
                                <Clock className="w-5 h-5 text-[#6b3e1e]" />
                            </div>
                            <h3 className="font-bold mb-1">24-Hour Window</h3>
                            <p className="text-sm text-zinc-500">Exchanges must be requested within 24 hours of purchase.</p>
                        </div>
                        <div className="p-6 rounded-2xl border border-zinc-200 text-center">
                            <div className="mx-auto w-10 h-10 rounded-full bg-[#6b3e1e]/5 flex items-center justify-center mb-4">
                                <ArrowLeftRight className="w-5 h-5 text-[#6b3e1e]" />
                            </div>
                            <h3 className="font-bold mb-1">Exchange Only</h3>
                            <p className="text-sm text-zinc-500">Note: No cash refunds. Valid for item exchange only.</p>
                        </div>
                        <div className="p-6 rounded-2xl border border-zinc-200 text-center">
                            <div className="mx-auto w-10 h-10 rounded-full bg-[#6b3e1e]/5 flex items-center justify-center mb-4">
                                <Receipt className="w-5 h-5 text-[#6b3e1e]" />
                            </div>
                            <h3 className="font-bold mb-1">Original Receipt</h3>
                            <p className="text-sm text-zinc-500">Valid original receipt must be provided for all requests.</p>
                        </div>
                    </div>

                    {/* Non-Eligible */}
                    <div className="border-t border-zinc-100 pt-12">
                        <h2 className="text-2xl font-bold mb-6">Non-Eligible Returns</h2>
                        <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100">
                            <p className="text-zinc-700 leading-relaxed">
                                We cannot accept returns or offer exchanges if you simply change your mind or bought an item by mistake. Please ensure all items in your cart are correct before final checkout.
                            </p>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="bg-[#6b3e1e]/5 rounded-3xl p-10 text-center border border-[#6b3e1e]/10">
                        <h2 className="text-2xl font-bold mb-4">How to Request a Return</h2>
                        <p className="text-zinc-600 mb-8 max-w-lg mx-auto">
                            To request an exchange, please call us directly with your order number and proof of purchase.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button asChild size="lg" className="bg-[#6b3e1e] hover:bg-[#5a3419]">
                                <a href="tel:+255786627873">Call: +255 786 627 873</a>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="border-[#6b3e1e] text-[#6b3e1e] hover:bg-[#6b3e1e]/5">
                                <Link href="/contact">Visit Contact Page</Link>
                            </Button>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}
