"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
    const [showMessageForm, setShowMessageForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success("Message Sent!", {
            description: "We'll get back to you as soon as possible.",
        });
        setFormData({ name: "", email: "", message: "" });
        setIsSubmitting(false);
        setShowMessageForm(false);
    };

    return (
        <div className="min-h-screen bg-[#FAF8F5]">
            {/* Header */}
            <section className="pt-32 pb-8 px-4">
                <div className="container mx-auto max-w-5xl text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#222222] mb-6">
                        How can we help?
                    </h1>
                    <p className="text-[#666666] text-base md:text-lg max-w-lg mx-auto">
                        Choose how you&apos;d like to reach us.
                    </p>
                </div>
            </section>

            {/* Divider */}
            <div className="container mx-auto max-w-5xl px-4">
                <hr className="border-[#E8E0D8]" />
            </div>

            {/* Cards Grid */}
            <section className="py-12 md:py-16 px-4">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Card 1: Call Us */}
                        <div className="flex flex-col items-center text-center border border-[#E0D6CC] rounded-2xl p-8 bg-white/50 hover:shadow-md transition-shadow">
                            {/* Phone Icon */}
                            <div className="mb-5">
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14.5 10C14.5 10 16.5 10 17.5 13C18.5 16 16 17.5 16 17.5C16 17.5 18.5 22.5 23 27C27.5 31.5 32 33 32 33C32 33 33.5 30.5 36.5 31.5C39.5 32.5 39.5 34.5 39.5 34.5C39.5 34.5 39 40 33 40C27 40 10 27 10 15C10 11 14.5 10 14.5 10Z" stroke="#6b3e1e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#222222] mb-2">Call Us</h3>
                            <p className="text-[#888888] text-sm mb-4">
                                Speak directly with<br />our team.
                            </p>
                            <div className="text-[#222222] text-sm font-semibold mb-1">
                                <a href="tel:+255786627873" className="hover:text-[#6b3e1e] transition-colors block">+255 786 627 873</a>
                                <a href="tel:+255769324445" className="hover:text-[#6b3e1e] transition-colors block">+255 769 324 445</a>
                            </div>
                            <div className="mt-auto pt-4">
                                <a
                                    href="tel:+255786627873"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#222222] hover:text-[#6b3e1e] underline underline-offset-4 transition-colors"
                                >
                                    Call Now <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Card 2: WhatsApp */}
                        <div className="flex flex-col items-center text-center border border-[#E0D6CC] rounded-2xl p-8 bg-white/50 hover:shadow-md transition-shadow">
                            {/* WhatsApp Icon */}
                            <div className="mb-5">
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14 34L10 38V14C10 12.8954 10.8954 12 12 12H36C37.1046 12 38 12.8954 38 14V32C38 33.1046 37.1046 34 36 34H14Z" stroke="#6b3e1e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M20 22C20 22 21 20 24 20C27 20 28 22 28 22" stroke="#6b3e1e" strokeWidth="1.8" strokeLinecap="round"/>
                                    <circle cx="19" cy="22" r="1" fill="#6b3e1e"/>
                                    <circle cx="29" cy="22" r="1" fill="#6b3e1e"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#222222] mb-2">WhatsApp</h3>
                            <p className="text-[#888888] text-sm mb-4">
                                Quick questions and<br />support.
                            </p>
                            <div className="mt-auto pt-4">
                                <a
                                    href="https://wa.me/255786627873"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#222222] hover:text-[#6b3e1e] underline underline-offset-4 transition-colors"
                                >
                                    Start a Chat <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Card 3: Book Grooming */}
                        <div className="flex flex-col items-center text-center border border-[#E0D6CC] rounded-2xl p-8 bg-white/50 hover:shadow-md transition-shadow">
                            {/* Scissors Icon */}
                            <div className="mb-5">
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="16" cy="34" r="4" stroke="#6b3e1e" strokeWidth="1.8"/>
                                    <circle cx="32" cy="34" r="4" stroke="#6b3e1e" strokeWidth="1.8"/>
                                    <line x1="19.5" y1="31.5" x2="32" y2="12" stroke="#6b3e1e" strokeWidth="1.8" strokeLinecap="round"/>
                                    <line x1="28.5" y1="31.5" x2="16" y2="12" stroke="#6b3e1e" strokeWidth="1.8" strokeLinecap="round"/>
                                    <circle cx="24" cy="22" r="2" fill="#6b3e1e"/>
                                    <circle cx="16" cy="12" r="2" fill="#6b3e1e"/>
                                    <circle cx="32" cy="12" r="2" fill="#6b3e1e"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#222222] mb-2">Book Grooming</h3>
                            <p className="text-[#888888] text-sm mb-4">
                                Schedule a grooming<br />appointment.
                            </p>
                            <div className="mt-auto pt-4">
                                <a
                                    href="/grooming"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#222222] hover:text-[#6b3e1e] underline underline-offset-4 transition-colors"
                                >
                                    Book Now <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Card 4: Visit Store */}
                        <div className="flex flex-col items-center text-center border border-[#E0D6CC] rounded-2xl p-8 bg-white/50 hover:shadow-md transition-shadow">
                            {/* Map Pin Icon */}
                            <div className="mb-5">
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M24 10C19.0294 10 15 14.0294 15 19C15 26.5 24 38 24 38C24 38 33 26.5 33 19C33 14.0294 28.9706 10 24 10Z" stroke="#6b3e1e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                    <circle cx="24" cy="19" r="3.5" stroke="#6b3e1e" strokeWidth="1.8"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#222222] mb-2">Visit Store</h3>
                            <p className="text-[#888888] text-sm mb-4">
                                Find our locations<br />and get directions.
                            </p>
                            <div className="mt-auto pt-4">
                                <a
                                    href="https://www.google.com/maps/dir//11+Slipway+Rd,+Dar+es+Salaam,+Tanzania/@-6.7642817,39.2653047,17z/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#222222] hover:text-[#6b3e1e] underline underline-offset-4 transition-colors"
                                >
                                    Get Directions <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Card 5: Opening Hours */}
                        <div className="flex flex-col items-center text-center border border-[#E0D6CC] rounded-2xl p-8 bg-white/50 hover:shadow-md transition-shadow">
                            {/* Clock Icon */}
                            <div className="mb-5">
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="24" cy="24" r="14" stroke="#6b3e1e" strokeWidth="1.8"/>
                                    <polyline points="24,16 24,24 30,28" stroke="#6b3e1e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#222222] mb-2">Opening Hours</h3>
                            <div className="text-sm text-[#555555] w-full max-w-[220px] mt-2 space-y-1.5">
                                <div className="flex justify-between">
                                    <span className="font-semibold text-[#222222]">Monday – Friday</span>
                                    <span>9:00 AM – 9:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-[#222222]">Saturday</span>
                                    <span>10:00 AM – 8:30 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-[#222222]">Sunday</span>
                                    <span className="text-red-500">Closed</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 6: Send a Message */}
                        <div className="flex flex-col items-center text-center border border-[#E0D6CC] rounded-2xl p-8 bg-white/50 hover:shadow-md transition-shadow">
                            {/* Envelope Icon */}
                            <div className="mb-5">
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="8" y="14" width="32" height="22" rx="2" stroke="#6b3e1e" strokeWidth="1.8"/>
                                    <polyline points="8,14 24,28 40,14" stroke="#6b3e1e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#222222] mb-2">Send a Message</h3>
                            <p className="text-[#888888] text-sm mb-4">
                                Send us a message<br />and we&apos;ll reply soon.
                            </p>
                            <div className="mt-auto pt-4">
                                <button
                                    onClick={() => setShowMessageForm(true)}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#222222] hover:text-[#6b3e1e] underline underline-offset-4 transition-colors"
                                >
                                    Send Message <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Message Form Modal */}
            {showMessageForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative">
                        <button
                            onClick={() => setShowMessageForm(false)}
                            className="absolute top-4 right-4 text-[#999] hover:text-[#222] text-2xl leading-none"
                        >
                            ×
                        </button>
                        <h2 className="text-2xl font-bold text-[#222222] mb-6">Send us a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#555] mb-1.5">Your Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border border-[#E0D6CC] bg-[#FAF8F5] text-[#222] placeholder:text-[#aaa] focus:outline-none focus:ring-2 focus:ring-[#6b3e1e]/20 focus:border-[#6b3e1e] transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#555] mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border border-[#E0D6CC] bg-[#FAF8F5] text-[#222] placeholder:text-[#aaa] focus:outline-none focus:ring-2 focus:ring-[#6b3e1e]/20 focus:border-[#6b3e1e] transition-colors"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#555] mb-1.5">Message</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-[#E0D6CC] bg-[#FAF8F5] text-[#222] placeholder:text-[#aaa] focus:outline-none focus:ring-2 focus:ring-[#6b3e1e]/20 focus:border-[#6b3e1e] transition-colors resize-none"
                                    placeholder="Tell us how we can help..."
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#222222] hover:bg-[#6b3e1e] text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? "Sending..." : "Send Message"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
