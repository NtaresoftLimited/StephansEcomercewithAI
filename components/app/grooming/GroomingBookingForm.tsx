"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Calendar, Clock, Dog, Cat, Check } from "lucide-react";
import { createGroomingBooking } from "@/lib/actions/grooming";

// Price lookup
const PRICES: Record<string, Record<string, Record<string, number>>> = {
    dog: {
        standard: { mini: 45000, small: 50000, medium: 60000, large: 70000 },
        premium: { mini: 50000, small: 60000, medium: 70000, large: 80000 },
        super_premium: { mini: 60000, small: 75000, medium: 85000, large: 90000 },
    },
    cat: {
        standard: { kitten: 45000, adult_cat: 60000 },
        premium: { kitten: 60000, adult_cat: 75000 },
        super_premium: { kitten: 75000, adult_cat: 85000 },
    },
};

const BREED_SIZES = {
    dog: [
        { value: "mini", label: "Mini Breeds" },
        { value: "small", label: "Small Breeds" },
        { value: "medium", label: "Medium Breeds" },
        { value: "large", label: "Large Breeds" },
    ],
    cat: [
        { value: "kitten", label: "Kitten (2-7 months)" },
        { value: "adult_cat", label: "Adult Cat (7+ months)" },
    ],
};

function formatPrice(price: number) {
    return new Intl.NumberFormat("en-TZ").format(price) + " TZS";
}

export function GroomingBookingForm() {
    const { user, isSignedIn } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        petType: "dog" as "dog" | "cat",
        petName: "",
        breedSize: "",
        package: "",
        appointmentDate: "",
        appointmentTime: "",
        customerName: user?.fullName || "",
        customerEmail: user?.emailAddresses[0]?.emailAddress || "",
        customerPhone: "",
        specialNotes: "",
        detangling: false,
    });

    // Calculate price
    const calculatePrice = () => {
        if (!formData.package || !formData.breedSize) return 0;
        const basePrice = PRICES[formData.petType]?.[formData.package]?.[formData.breedSize] || 0;
        const detanglingFee = formData.detangling ? 30000 : 0;
        return basePrice + detanglingFee;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const result = await createGroomingBooking({
                ...formData,
                price: calculatePrice(),
                clerkUserId: user?.id,
            });

            if (result.success) {
                setIsSuccess(true);
            } else {
                setError(result.error || "Failed to create booking");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <section id="booking" className="py-16 px-4 bg-green-50 dark:bg-green-900/20">
                <div className="mx-auto max-w-2xl text-center">
                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                        <Check className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-4">
                        Booking Confirmed!
                    </h2>
                    <p className="text-green-700 dark:text-green-300 mb-6">
                        We've received your grooming appointment request. You'll receive a
                        confirmation email shortly with all the details.
                    </p>
                    <button
                        onClick={() => {
                            setIsSuccess(false);
                            setFormData({
                                petType: "dog",
                                petName: "",
                                breedSize: "",
                                package: "",
                                appointmentDate: "",
                                appointmentTime: "",
                                customerName: user?.fullName || "",
                                customerEmail: user?.emailAddresses[0]?.emailAddress || "",
                                customerPhone: "",
                                specialNotes: "",
                                detangling: false,
                            });
                        }}
                        className="rounded-full bg-green-600 px-6 py-2 text-white hover:bg-green-700"
                    >
                        Book Another Appointment
                    </button>
                </div>
            </section>
        );
    }


    return (
        <section id="booking" className="py-16 px-4 bg-[#f5ebe0]/30 dark:bg-zinc-900/50">
            <div className="mx-auto max-w-5xl">
                <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-white mb-4">
                    Book Your Appointment
                </h2>
                <p className="text-center text-zinc-600 dark:text-zinc-400 mb-8">
                    Fill out the form below to schedule a grooming session for your pet
                </p>

                <form onSubmit={handleSubmit} className="rounded-2xl bg-white dark:bg-zinc-800 shadow-xl p-6 md:p-10 border border-[#6b3e1e]/10">
                    {error && (
                        <div className="mb-6 rounded-lg bg-red-100 dark:bg-red-900/30 p-4 text-red-700 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    {/* Pet Type Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                            Pet Type
                        </label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, petType: "dog", breedSize: "" })}
                                className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${formData.petType === "dog"
                                    ? "border-[#6b3e1e] bg-[#6b3e1e]/10"
                                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                                    }`}
                            >
                                <Dog className="h-6 w-6" />
                                <span className="font-semibold">Dog</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, petType: "cat", breedSize: "" })}
                                className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${formData.petType === "cat"
                                    ? "border-[#6b3e1e] bg-[#6b3e1e]/10"
                                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                                    }`}
                            >
                                <Cat className="h-6 w-6" />
                                <span className="font-semibold">Cat</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Pet Name */}
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                Pet Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.petName}
                                onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-3 text-zinc-900 dark:text-white focus:border-amber-500 focus:ring-amber-500"
                                placeholder="Enter your pet's name"
                            />
                        </div>

                        {/* Breed Size */}
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                Breed Size *
                            </label>
                            <select
                                required
                                value={formData.breedSize}
                                onChange={(e) => setFormData({ ...formData, breedSize: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-3 text-zinc-900 dark:text-white focus:border-amber-500 focus:ring-amber-500"
                            >
                                <option value="">Select size</option>
                                {BREED_SIZES[formData.petType].map((size) => (
                                    <option key={size.value} value={size.value}>
                                        {size.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Package */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                Package *
                            </label>
                            <div className="grid gap-3 sm:grid-cols-3">
                                {[
                                    { value: "standard", label: "Standard", color: "blue" },
                                    { value: "premium", label: "Premium", color: "purple" },
                                    { value: "super_premium", label: "Super Premium", color: "amber" },
                                ].map((pkg) => (
                                    <button
                                        key={pkg.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, package: pkg.value })}
                                        className={`rounded-lg border-2 p-4 text-center transition-all ${formData.package === pkg.value
                                            ? "border-[#6b3e1e] bg-[#6b3e1e]/10"
                                            : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                                            }`}
                                    >
                                        <span className="font-semibold block">{pkg.label}</span>
                                        {formData.breedSize && (
                                            <span className="text-sm text-zinc-500">
                                                {formatPrice(PRICES[formData.petType]?.[pkg.value]?.[formData.breedSize] || 0)}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                <Calendar className="inline h-4 w-4 mr-1" />
                                Preferred Date *
                            </label>
                            <input
                                type="date"
                                required
                                min={new Date().toISOString().split("T")[0]}
                                value={formData.appointmentDate}
                                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-3 text-zinc-900 dark:text-white focus:border-amber-500 focus:ring-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                <Clock className="inline h-4 w-4 mr-1" />
                                Preferred Time *
                            </label>
                            <select
                                required
                                value={formData.appointmentTime}
                                onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-3 text-zinc-900 dark:text-white focus:border-amber-500 focus:ring-amber-500"
                            >
                                <option value="">Select time</option>
                                <option value="09:00">9:00 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="12:00">12:00 PM</option>
                                <option value="14:00">2:00 PM</option>
                                <option value="15:00">3:00 PM</option>
                                <option value="16:00">4:00 PM</option>
                            </select>
                        </div>

                        {/* Customer Info */}
                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                Your Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.customerName}
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-3 text-zinc-900 dark:text-white focus:border-amber-500 focus:ring-amber-500"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                required
                                value={formData.customerPhone}
                                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-3 text-zinc-900 dark:text-white focus:border-amber-500 focus:ring-amber-500"
                                placeholder="+255 XXX XXX XXX"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.customerEmail}
                                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-3 text-zinc-900 dark:text-white focus:border-amber-500 focus:ring-amber-500"
                                placeholder="your@email.com"
                            />
                        </div>

                        {/* Additional Services */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.detangling}
                                    onChange={(e) => setFormData({ ...formData, detangling: e.target.checked })}
                                    className="h-5 w-5 rounded border-zinc-300 text-amber-500 focus:ring-amber-500"
                                />
                                <span className="text-zinc-700 dark:text-zinc-300">
                                    Add Detangling Service (+30,000 TZS)
                                </span>
                            </label>
                        </div>

                        {/* Special Notes */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                Special Notes (Optional)
                            </label>
                            <textarea
                                value={formData.specialNotes}
                                onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                                rows={3}
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-3 text-zinc-900 dark:text-white focus:border-amber-500 focus:ring-amber-500"
                                placeholder="Any special instructions or concerns about your pet..."
                            />
                        </div>
                    </div>

                    {/* Price Summary */}
                    {formData.package && formData.breedSize && (
                        <div className="mt-6 rounded-lg bg-[#6b3e1e]/10 p-4">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                    Total Price:
                                </span>
                                <span className="text-2xl font-bold text-[#6b3e1e]">
                                    {formatPrice(calculatePrice())}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-6 w-full rounded-lg bg-gradient-to-r from-[#6b3e1e] to-[#8b5a2b] py-4 font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Booking..." : "Confirm Booking"}
                    </button>

                    {!isSignedIn && (
                        <p className="mt-4 text-center text-sm text-zinc-500">
                            Sign in to save your booking to your account
                        </p>
                    )}
                </form>
            </div>
        </section>
    );
}
