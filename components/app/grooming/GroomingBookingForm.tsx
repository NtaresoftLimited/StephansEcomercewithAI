"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Calendar, Clock, Check } from "lucide-react";
import Image from "next/image";
import { createGroomingBooking } from "@/lib/actions/grooming";
import { PRICES, BREED_SIZES, VALID_TIMES, SIZE_LABELS, DOG_PACKAGES, CAT_PACKAGES } from "@/lib/constants/grooming";

import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { BookingSuccessModal } from "./BookingSuccessModal";

function useSessionSafe() {
    try {
        return useSession();
    } catch {
        return { data: null, status: "unauthenticated" } as any;
    }
}

interface GroomingBookingFormProps {
    prices?: typeof PRICES;
}

export function GroomingBookingForm({ prices = PRICES }: GroomingBookingFormProps) {
    const searchParams = useSearchParams();
    const { data: session, status: authStatus } = useSessionSafe();
    const isSignedIn = authStatus === "authenticated";
    const user = session?.user;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [formData, setFormData] = useState({
        petType: "dog" as "dog" | "cat",
        petName: "",
        breedSize: "",
        package: "",
        appointmentDate: "",
        appointmentTime: "",
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        specialNotes: "",
        detangling: false,
    });

    // Initialize customer info from session when it becomes available
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                customerName: prev.customerName || user.name || "",
                customerEmail: prev.customerEmail || user.email || "",
            }));
        }
    }, [user]);

    useEffect(() => {
        const urlPackage = (searchParams.get("package") || "").trim();
        const urlPetType = (searchParams.get("petType") || "").trim();
        const urlSize = (searchParams.get("size") || "").trim();
        const validPackages = new Set(["standard", "premium", "super_premium"]);
        const validPetTypes = new Set(["dog", "cat"]);
        const next: Partial<typeof formData> = {};
        const petTypeToUse = validPetTypes.has(urlPetType) ? (urlPetType as "dog" | "cat") : undefined;
        if (petTypeToUse) next.petType = petTypeToUse;
        if (petTypeToUse) next.breedSize = "";
        if (validPackages.has(urlPackage)) {
            next.package = urlPackage;
        }
        const sizeSet = new Set((petTypeToUse || formData.petType) && BREED_SIZES[petTypeToUse || formData.petType].map((s) => s.value));
        if (urlSize && sizeSet.has(urlSize)) {
            next.breedSize = urlSize;
        }
        if (Object.keys(next).length > 0) {
            setFormData((prev) => ({ ...prev, ...next }));
        }
    }, [searchParams]);

    // Calculate price
    const calculatePrice = () => {
        if (!formData.package || !formData.breedSize) return 0;
        const basePrice = prices[formData.petType]?.[formData.package]?.[formData.breedSize] || 0;
        const detanglingFee = formData.detangling ? 30000 : 0;
        return basePrice + detanglingFee;
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateStr = e.target.value;
        if (!dateStr) {
            setFormData({ ...formData, appointmentDate: "" });
            return;
        }
        
        const date = new Date(dateStr);
        if (date.getDay() === 0) { // 0 is Sunday
            toast.error("We are closed on Sundays", {
                description: "Please select another day for your pet's grooming."
            });
            setFormData({ ...formData, appointmentDate: "" });
            return;
        }
        
        setFormData({ ...formData, appointmentDate: dateStr });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const toastId = toast.loading('Recording your booking...');

        try {
            let bookingNumber = `GRM-WIP-${Date.now().toString(36).toUpperCase()}`;
            
            try {
                const result = await createGroomingBooking({
                    ...formData,
                    userId: user?.id,
                });
                
                if (result.success && result.bookingNumber) {
                    bookingNumber = result.bookingNumber;
                    toast.success('Booking recorded! Redirecting to WhatsApp...', { id: toastId });
                } else {
                    console.warn("Database sync failed/skipped, using fallback offline booking ref. Error:", result.error);
                    bookingNumber = `GRM-OFF-${Date.now().toString(36).toUpperCase()}`;
                    toast.success('Redirecting to WhatsApp...', { id: toastId });
                }
            } catch (err) {
                console.error("Failed to sync booking to database, proceeding to WhatsApp anyway:", err);
                bookingNumber = `GRM-OFF-${Date.now().toString(36).toUpperCase()}`;
                toast.success('Redirecting to WhatsApp...', { id: toastId });
            }

            // Construct WhatsApp Message
            const pkgName = formData.package === 'standard' ? 'Standard Package' :
                            formData.package === 'premium' ? 'Premium Package' :
                            formData.package === 'super_premium' ? 'Super Premium Package' : formData.package;
                            
            const sizeLabel = SIZE_LABELS[formData.breedSize] || formData.breedSize;
            const petTypeLabel = formData.petType === 'dog' ? 'Dog 🐕' : 'Cat 🐈';
            const extraServices = formData.detangling ? 'Detangling Service (+30,000 TZS)' : 'None';
            const basePrice = prices[formData.petType]?.[formData.package]?.[formData.breedSize] || 0;
            const detanglingFee = formData.detangling ? 30000 : 0;
            const totalPrice = basePrice + detanglingFee;

            let formattedDate = formData.appointmentDate;
            try {
                formattedDate = new Date(formData.appointmentDate).toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                });
            } catch (dateErr) {
                console.error("Error formatting date:", dateErr);
            }
            
            const customerMessage = `Hi Stephan's Pet Store!\n` +
                   `I want to book a grooming appointment:\n\n` +
                   `*GROOMING APPOINTMENT BOOKING*\n` +
                   `----------------------------------\n` +
                   `*Booking Ref:* #${bookingNumber}\n` +
                   `*Customer Name:* ${formData.customerName}\n` +
                   `*Phone Number:* ${formData.customerPhone}\n` +
                   `*Email Address:* ${formData.customerEmail || 'N/A'}\n\n` +
                   `*PET DETAILS*\n` +
                   `*Pet Name:* ${formData.petName} (${formData.petType === 'dog' ? 'Dog' : 'Cat'})\n` +
                   `*Breed Size:* ${sizeLabel}\n\n` +
                   `*SERVICE DETAILS*\n` +
                   `*Selected Package:* ${pkgName}\n` +
                   `*Extra Service:* ${extraServices}\n` +
                   `*Preferred Date:* ${formattedDate}\n` +
                   `*Preferred Time:* ${formData.appointmentTime}\n\n` +
                   `*PRICE SUMMARY*\n` +
                   `  - Package Price: ${formatPrice(basePrice)}\n` +
                   (formData.detangling ? `  - Detangling Fee: ${formatPrice(detanglingFee)}\n` : '') +
                   `----------------------------------\n` +
                   `*Total Amount:* ${formatPrice(totalPrice)}\n\n` +
                   (formData.specialNotes ? `*Special Notes:*\n${formData.specialNotes}\n` : '');

            const encodedMessage = encodeURIComponent(customerMessage);
            const whatsappUrl = `https://wa.me/255769324445?text=${encodedMessage}`;

            // Reset form before leaving
            resetForm();

            // Redirect customer to WhatsApp
            window.location.href = whatsappUrl;
        } catch (err: any) {
            console.error("Booking redirect failed:", err);
            toast.error(err.message || "An unexpected error occurred", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setShowSuccessModal(false);
        setFormData({
            petType: "dog",
            petName: "",
            breedSize: "",
            package: "",
            appointmentDate: "",
            appointmentTime: "",
            customerName: user?.name || "",
            customerEmail: user?.email || "",
            customerPhone: "",
            specialNotes: "",
            detangling: false,
        });
    };


    return (
        <section id="booking" className="py-16 px-4 bg-[#f5ebe0]/30 dark:bg-zinc-900/50">
            <div className="mx-auto max-w-5xl">
                <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-white mb-4">
                    Book Your Appointment
                </h2>
                <p className="text-center text-zinc-600 dark:text-zinc-400 mb-8">
                    Fill out the form below to schedule a grooming session for your pet
                </p>

                <form onSubmit={handleSubmit} className="rounded-2xl bg-white dark:bg-zinc-800 shadow-xl p-6 md:p-10 border border-[#c77e35]/10">

                    {/* Pet Type Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                            Pet Type
                        </label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, petType: "dog", breedSize: "" })}
                                className={`flex-1 flex items-center justify-center gap-3 rounded-xl border-2 p-5 transition-all ${formData.petType === "dog"
                                    ? "border-[#c77e35] bg-[#c77e35]/5"
                                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                                    }`}
                            >
                                <div className="relative w-8 h-8 flex items-center justify-center">
                                    <Image 
                                        src="/icons/icon-dog.png" 
                                        alt="Dog" 
                                        width={32} 
                                        height={32}
                                        className={`object-contain transition-all ${formData.petType === "dog" ? "opacity-100" : "opacity-40 grayscale"}`}
                                    />
                                </div>
                                <span className={`font-bold text-lg ${formData.petType === "dog" ? "text-[#c77e35]" : "text-zinc-600"}`}>Dog</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, petType: "cat", breedSize: "" })}
                                className={`flex-1 flex items-center justify-center gap-3 rounded-xl border-2 p-5 transition-all ${formData.petType === "cat"
                                    ? "border-[#c77e35] bg-[#c77e35]/5"
                                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                                    }`}
                            >
                                <div className="relative w-8 h-8 flex items-center justify-center">
                                    <Image 
                                        src="/icons/icon-cat.png" 
                                        alt="Cat" 
                                        width={32} 
                                        height={32}
                                        className={`object-contain transition-all ${formData.petType === "cat" ? "opacity-100" : "opacity-40 grayscale"}`}
                                    />
                                </div>
                                <span className={`font-bold text-lg ${formData.petType === "cat" ? "text-[#c77e35]" : "text-zinc-600"}`}>Cat</span>
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
                                        aria-pressed={formData.package === pkg.value}
                                        data-selected={formData.package === pkg.value || undefined}
                                        className={`relative rounded-lg border-2 p-4 text-center transition-all ${formData.package === pkg.value
                                            ? "border-[#c77e35] bg-[#c77e35]/10 ring-2 ring-[#c77e35]/30 shadow-md"
                                            : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                                            }`}
                                    >
                                        <span className={`font-semibold block ${formData.package === pkg.value ? "text-[#c77e35]" : ""}`}>{pkg.label}</span>
                                        {formData.package === pkg.value && (
                                            <Check className="absolute right-2 top-2 h-4 w-4 text-[#c77e35]" />
                                        )}
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
                                onChange={handleDateChange}
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
                                {VALID_TIMES.map((time) => (
                                    <option key={time.value} value={time.value}>
                                        {time.label}
                                    </option>
                                ))}
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
                                Email
                            </label>
                            <input
                                type="email"
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
                        <div className="mt-6 rounded-lg bg-[#c77e35]/10 p-4">
                            {/* Breakdown */}
                            <div className="space-y-2 mb-3 border-b border-[#c77e35]/20 pb-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-600 dark:text-zinc-400">
                                        {(formData.petType === 'dog' ? DOG_PACKAGES : CAT_PACKAGES)[formData.package as keyof typeof DOG_PACKAGES]?.name || formData.package}
                                        {' '}
                                        <span className="text-xs opacity-80">
                                            ({SIZE_LABELS[formData.breedSize] || formData.breedSize})
                                        </span>
                                    </span>
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {formatPrice(PRICES[formData.petType]?.[formData.package]?.[formData.breedSize] || 0)}
                                    </span>
                                </div>
                                {formData.detangling && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-600 dark:text-zinc-400">
                                            Detangling Fee
                                        </span>
                                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                            {formatPrice(30000)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                    Total Price:
                                </span>
                                <span className="text-2xl font-bold text-[#c77e35]">
                                    {formatPrice(calculatePrice())}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-6 w-full rounded-lg bg-gradient-to-r from-[#c77e35] to-[#c77e35] py-4 font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Booking..." : "Confirm Booking"}
                    </button>
                </form>
            </div>

            <BookingSuccessModal 
                isOpen={showSuccessModal} 
                onClose={resetForm}
                bookingDetails={{
                    petName: formData.petName,
                    package: formData.package,
                    date: formData.appointmentDate,
                    time: formData.appointmentTime,
                    price: calculatePrice()
                }}
            />
        </section>
    );
}
