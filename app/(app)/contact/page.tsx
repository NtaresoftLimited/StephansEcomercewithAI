"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const HOURS = [
    { day: "Monday", time: "9 AM – 8:30 PM" },
    { day: "Tuesday", time: "9 AM – 8:30 PM" },
    { day: "Wednesday", time: "9 AM – 8:30 PM" },
    { day: "Thursday", time: "9 AM – 8:30 PM" },
    { day: "Friday", time: "9 AM – 8:30 PM" },
    { day: "Saturday", time: "10 AM – 8:30 PM" },
    { day: "Sunday", time: "Closed" },
];

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 1000));

        toast.success("Message Sent!", {
            description: "We'll get back to you as soon as possible.",
        });

        setFormData({ name: "", email: "", subject: "", message: "" });
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#6b3e1e]/10 via-amber-50 to-orange-50 py-16 md:py-20">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-[#6b3e1e] rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-amber-500 rounded-full blur-3xl" />
                </div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4">
                        Contact Us
                    </h1>
                    <p className="text-zinc-600 max-w-xl mx-auto text-lg">
                        Have a question or need help? We&apos;re here for you and your furry friends.
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Contact Info */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-zinc-100">
                                <h2 className="text-xl font-bold text-zinc-900 mb-6">
                                    Get in Touch
                                </h2>
                                <div className="space-y-5">
                                    {/* Address */}
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-[#6b3e1e]/10 flex items-center justify-center flex-shrink-0">
                                            <MapPin className="h-5 w-5 text-[#6b3e1e]" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-zinc-900">Address</h3>
                                            <p className="text-zinc-500 text-sm">
                                                11 Slipway Rd<br />
                                                Masaki, Dar es Salaam, Tanzania
                                            </p>
                                            <a
                                                href="https://www.google.com/maps/dir//11+Slipway+Rd,+Dar+es+Salaam,+Tanzania/@-6.7642817,39.2653047,17z/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block mt-2 text-sm text-[#6b3e1e] hover:underline font-medium"
                                            >
                                                Get Directions →
                                            </a>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-[#6b3e1e]/10 flex items-center justify-center flex-shrink-0">
                                            <Phone className="h-5 w-5 text-[#6b3e1e]" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-zinc-900">Phone</h3>
                                            <div className="flex flex-col gap-1">
                                                <a
                                                    href="tel:+255786627873"
                                                    className="text-zinc-500 text-sm hover:text-[#6b3e1e] transition-colors"
                                                >
                                                    +255 786 627 873
                                                </a>
                                                <a
                                                    href="tel:+255769324445"
                                                    className="text-zinc-500 text-sm hover:text-[#6b3e1e] transition-colors"
                                                >
                                                    +255 769 324 445
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-[#6b3e1e]/10 flex items-center justify-center flex-shrink-0">
                                            <Mail className="h-5 w-5 text-[#6b3e1e]" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-zinc-900">Email</h3>
                                            <a
                                                href="mailto:info@stephanspetstore.co.tz"
                                                className="text-zinc-500 text-sm hover:text-[#6b3e1e] transition-colors"
                                            >
                                                info@stephanspetstore.co.tz
                                            </a>
                                        </div>
                                    </div>

                                    {/* Hours */}
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-[#6b3e1e]/10 flex items-center justify-center flex-shrink-0">
                                            <Clock className="h-5 w-5 text-[#6b3e1e]" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-zinc-900 mb-2">Hours</h3>
                                            <div className="text-zinc-500 text-sm space-y-1">
                                                {HOURS.map((h) => (
                                                    <div key={h.day} className="flex justify-between">
                                                        <span className="font-medium text-zinc-600">{h.day}</span>
                                                        <span className={h.time === "Closed" ? "text-red-500" : ""}>
                                                            {h.time}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-zinc-100">
                                <h2 className="text-xl font-bold text-zinc-900 mb-6">
                                    Send us a Message
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                                Your Name
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#6b3e1e]/20 focus:border-[#6b3e1e] transition-colors"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#6b3e1e]/20 focus:border-[#6b3e1e] transition-colors"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#6b3e1e]/20 focus:border-[#6b3e1e] transition-colors"
                                            placeholder="How can we help?"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">
                                            Message
                                        </label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#6b3e1e]/20 focus:border-[#6b3e1e] transition-colors resize-none"
                                            placeholder="Tell us more about your inquiry..."
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-[#6b3e1e] hover:bg-[#5a3419] text-white px-8 py-6 text-base font-semibold rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">
                                                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Send className="h-4 w-4" />
                                                Send Message
                                            </span>
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
