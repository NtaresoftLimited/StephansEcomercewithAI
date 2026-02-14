import { Metadata } from "next";
import { HelpCircle, Plus, Minus } from "lucide-react";

export const metadata: Metadata = {
    title: "FAQ - Frequently Asked Questions",
    description: "Find answers to common questions about Stephan's Pet Store products, services, shipping, and more.",
};

export default function FAQPage() {
    const faqs = [
        {
            category: "Orders & Shipping",
            questions: [
                {
                    q: "Do you offer delivery services?",
                    a: "Yes! We offer free delivery within Dar es Salaam for orders over a specified minimum amount. Delivery fees apply for smaller orders. We also ship to selected areas outside Dar es Salaam. Contact us for more information about delivery to your area.",
                },
                {
                    q: "How long does delivery take?",
                    a: "Within Dar es Salaam, most deliveries are completed within 24-48 hours. For areas outside Dar es Salaam, delivery times vary depending on location. We'll provide you with an estimated delivery time when you place your order.",
                },
                {
                    q: "Can I track my order?",
                    a: "Yes! Once your order is dispatched, you'll receive tracking information via SMS or WhatsApp. You can also check your order status by logging into your account on our website.",
                },
                {
                    q: "What payment methods do you accept?",
                    a: "We accept cash on delivery, mobile money (M-Pesa, Tigo Pesa, Airtel Money), credit/debit cards, and bank transfers. Payment options are shown during checkout.",
                },
            ],
        },
        {
            category: "Products",
            questions: [
                {
                    q: "How do I choose the right food for my pet?",
                    a: "We recommend consulting with our staff or your veterinarian to determine the best food for your pet's age, breed, size, and health condition. Our team is always happy to provide personalized recommendations based on your pet's specific needs.",
                },
                {
                    q: "Are your products authentic and safe?",
                    a: "Absolutely! We source all our products from authorized distributors and reputable brands. We carefully vet every product we sell to ensure it meets our high standards for quality and safety.",
                },
                {
                    q: "Do you have products for exotic pets?",
                    a: "Yes, we carry products for a variety of pets including birds, fish, small animals, and more. If you're looking for something specific, feel free to contact us and we'll do our best to source it for you.",
                },
                {
                    q: "Can I return opened pet food?",
                    a: "For health and safety reasons, we cannot accept returns of opened food products. However, if there's a quality issue with the product, please contact us immediately and we'll work with you to find a solution.",
                },
            ],
        },
        {
            category: "Grooming Services",
            questions: [
                {
                    q: "How do I book a grooming appointment?",
                    a: "You can book an appointment by calling us at +255 769 324 445, messaging us on WhatsApp, or visiting our store. We recommend booking in advance, especially for weekends and holidays.",
                },
                {
                    q: "What grooming services do you offer?",
                    a: "We offer a full range of grooming services including bathing, haircuts, nail trimming, ear cleaning, teeth brushing, and more. Our professional groomers can handle all breeds and sizes of dogs and cats.",
                },
                {
                    q: "How long does a grooming session take?",
                    a: "The duration depends on your pet's size, coat condition, and the services requested. On average, a full grooming session takes 2-4 hours. We'll provide you with an estimated time when you book your appointment.",
                },
                {
                    q: "What should I bring for my pet's grooming appointment?",
                    a: "Just bring your pet! We provide all necessary grooming supplies. If your pet has any special requirements or health conditions, please let us know when booking so we can prepare accordingly.",
                },
            ],
        },
        {
            category: "Returns & Refunds",
            questions: [
                {
                    q: "What is your return policy?",
                    a: "We accept returns within 7 days of delivery for unopened products in their original packaging. Please see our Return Policy page for complete details and conditions.",
                },
                {
                    q: "How do I request a refund?",
                    a: "To request a refund, contact our customer service within 7 days of receiving your order. We'll guide you through the return process and process your refund once we receive and verify the returned item.",
                },
                {
                    q: "How long does it take to receive a refund?",
                    a: "Refunds are typically processed within 7-14 business days after we receive and verify the returned product. The refund will be issued to your original payment method.",
                },
                {
                    q: "Can I exchange a product instead of returning it?",
                    a: "Yes! If you'd like to exchange a product for a different size, flavor, or variant, please contact us. We'll arrange the exchange for you, subject to product availability.",
                },
            ],
        },
        {
            category: "Account & Support",
            questions: [
                {
                    q: "Do I need an account to make a purchase?",
                    a: "No, you can checkout as a guest. However, creating an account allows you to track orders, save your shipping information, and access exclusive offers and promotions.",
                },
                {
                    q: "How do I reset my password?",
                    a: "Click on 'Sign In' at the top of the page, then select 'Forgot Password'. Enter your email address and we'll send you instructions to reset your password.",
                },
                {
                    q: "How can I contact customer service?",
                    a: "You can reach us by phone at +255 769 324 445, via WhatsApp, email at info@stephanspetstore.co.tz, or visit our store at 11 Slipway Road, Dar es Salaam. We're here to help!",
                },
                {
                    q: "What are your store hours?",
                    a: "We're open Monday to Friday from 9 AM to 6 PM, and Saturday from 10 AM to 8:30 PM. We're closed on Sundays and public holidays.",
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-3 bg-[#6b3e1e]/10 rounded-full mb-4">
                        <HelpCircle className="h-8 w-8 text-[#6b3e1e]" />
                    </div>
                    <h1 className="text-4xl font-bold text-zinc-900 mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
                        Find answers to common questions about our products, services, and policies.
                    </p>
                </div>

                {/* FAQ Sections */}
                <div className="space-y-12">
                    {faqs.map((section, sectionIdx) => (
                        <div key={sectionIdx}>
                            <h2 className="text-2xl font-bold text-zinc-900 mb-6 border-b border-zinc-200 pb-3">
                                {section.category}
                            </h2>
                            <div className="space-y-4">
                                {section.questions.map((faq, faqIdx) => (
                                    <details
                                        key={faqIdx}
                                        className="group bg-white rounded-lg border border-zinc-200 overflow-hidden hover:border-[#6b3e1e]/30 transition-colors"
                                    >
                                        <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-zinc-900 list-none">
                                            <span className="pr-8">{faq.q}</span>
                                            <Plus className="h-5 w-5 text-[#6b3e1e] flex-shrink-0 group-open:hidden" />
                                            <Minus className="h-5 w-5 text-[#6b3e1e] flex-shrink-0 hidden group-open:block" />
                                        </summary>
                                        <div className="px-6 pb-6 pt-2 text-zinc-600 leading-relaxed">
                                            {faq.a}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="mt-16 bg-[#6b3e1e]/5 rounded-2xl p-8 border border-[#6b3e1e]/20 text-center">
                    <h2 className="text-2xl font-bold text-zinc-900 mb-3">
                        Still Have Questions?
                    </h2>
                    <p className="text-zinc-600 mb-6">
                        Can't find the answer you're looking for? Our friendly team is here to help!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/contact"
                            className="inline-flex items-center justify-center px-6 py-3 bg-[#6b3e1e] text-white rounded-lg hover:bg-[#5a3419] transition-colors font-medium"
                        >
                            Contact Us
                        </a>
                        <a
                            href="https://wa.me/255769324445"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#6b3e1e] border-2 border-[#6b3e1e] rounded-lg hover:bg-[#6b3e1e] hover:text-white transition-colors font-medium"
                        >
                            Chat on WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
