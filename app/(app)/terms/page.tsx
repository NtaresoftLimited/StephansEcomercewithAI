import { Metadata } from "next";
import { Scale, FileText, Shield, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
    title: "Terms & Conditions",
    description: "Read our terms and conditions for using Stephan's Pet Store services and purchasing products.",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-[#6b3e1e]/10 rounded-full mb-4">
                        <Scale className="h-8 w-8 text-[#6b3e1e]" />
                    </div>
                    <h1 className="text-4xl font-bold text-zinc-900 mb-4">
                        Terms & Conditions
                    </h1>
                    <p className="text-zinc-600">
                        Last updated: February 2026
                    </p>
                </div>

                {/* Content */}
                <div className="prose prose-zinc max-w-none">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-900">
                            Please read these terms and conditions carefully before using our services or making a purchase. By accessing our website or making a purchase, you agree to be bound by these terms.
                        </p>
                    </div>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                            <FileText className="h-6 w-6 text-[#6b3e1e]" />
                            1. General Terms
                        </h2>
                        <p className="text-zinc-700 mb-4">
                            By accessing and using Stephan's Pet Store website and services, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our services.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-700">
                            <li>You must be at least 18 years old to make purchases</li>
                            <li>You are responsible for maintaining the confidentiality of your account</li>
                            <li>You agree to provide accurate and current information</li>
                            <li>We reserve the right to refuse service to anyone for any reason</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-4">2. Products and Services</h2>
                        <p className="text-zinc-700 mb-4">
                            All products and services are subject to availability. We reserve the right to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-700">
                            <li>Limit quantities of products available for purchase</li>
                            <li>Discontinue any product or service at any time</li>
                            <li>Modify product descriptions and pricing without notice</li>
                            <li>Refuse orders that appear fraudulent or violate our policies</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-4">3. Pricing and Payment</h2>
                        <p className="text-zinc-700 mb-4">
                            All prices are listed in Tanzanian Shillings (TZS) unless otherwise stated. We accept the following payment methods:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-700">
                            <li>Cash on delivery</li>
                            <li>Mobile money (M-Pesa, Tigo Pesa, Airtel Money)</li>
                            <li>Credit/Debit cards</li>
                            <li>Bank transfers</li>
                        </ul>
                        <p className="text-zinc-700 mt-4">
                            Prices are subject to change without notice. We reserve the right to correct pricing errors on our website.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-4">4. Delivery</h2>
                        <p className="text-zinc-700 mb-4">
                            We offer delivery services within Dar es Salaam and selected areas in Tanzania:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-700">
                            <li>Free delivery for orders over a specified minimum amount within Dar es Salaam</li>
                            <li>Delivery fees apply for orders below the minimum amount</li>
                            <li>Delivery times are estimates and not guaranteed</li>
                            <li>We are not responsible for delays caused by factors beyond our control</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-4">5. Returns and Refunds</h2>
                        <p className="text-zinc-700 mb-4">
                            Please refer to our <a href="/return-policy" className="text-[#6b3e1e] hover:underline">Return Policy</a> for detailed information about returns and refunds. In summary:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-700">
                            <li>Products must be returned within 7 days of delivery</li>
                            <li>Items must be in original, unopened packaging</li>
                            <li>Perishable items and opened food cannot be returned</li>
                            <li>Refunds are processed within 7-14 business days</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                            <Shield className="h-6 w-6 text-[#6b3e1e]" />
                            6. Privacy and Data Protection
                        </h2>
                        <p className="text-zinc-700 mb-4">
                            We are committed to protecting your privacy and personal information:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-700">
                            <li>We collect only necessary information for order processing</li>
                            <li>Your personal data is stored securely and never sold to third parties</li>
                            <li>We use cookies to improve your browsing experience</li>
                            <li>You have the right to request access to or deletion of your personal data</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-4">7. Grooming Services</h2>
                        <p className="text-zinc-700 mb-4">
                            For our grooming services, additional terms apply:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-700">
                            <li>Appointments must be booked in advance</li>
                            <li>Cancellations must be made at least 24 hours before the appointment</li>
                            <li>We reserve the right to refuse service if a pet shows signs of aggression or illness</li>
                            <li>Pet owners are responsible for informing us of any health conditions or special requirements</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-4">8. Limitation of Liability</h2>
                        <p className="text-zinc-700">
                            Stephan's Pet Store shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or services. Our liability is limited to the purchase price of the product or service in question.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-4">9. Changes to Terms</h2>
                        <p className="text-zinc-700">
                            We reserve the right to modify these terms and conditions at any time. Changes will be effective immediately upon posting to our website. Your continued use of our services after changes are posted constitutes acceptance of the modified terms.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-4">10. Contact Information</h2>
                        <p className="text-zinc-700 mb-4">
                            If you have any questions about these terms and conditions, please contact us:
                        </p>
                        <div className="bg-zinc-50 rounded-lg p-6 border border-zinc-200">
                            <p className="text-zinc-700 mb-2"><strong>Stephan's Pet Store</strong></p>
                            <p className="text-zinc-600 mb-1">11 Slipway Road, Dar es Salaam, Tanzania</p>
                            <p className="text-zinc-600 mb-1">Phone: +255 769 324 445</p>
                            <p className="text-zinc-600">Email: info@stephanspetstore.co.tz</p>
                        </div>
                    </section>

                    <div className="bg-[#6b3e1e]/5 rounded-lg p-6 mt-12 border border-[#6b3e1e]/20">
                        <p className="text-sm text-zinc-700 text-center">
                            By using our website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
