"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Check, Calendar as CalendarIcon, Scissors, Paintbrush, Wand2, ArrowRight } from "lucide-react";
import { createGroomingBooking } from "@/lib/actions/grooming";
import { PRICES, BREED_SIZES, VALID_TIMES, SIZE_LABELS, DOG_PACKAGES, CAT_PACKAGES } from "@/lib/constants/grooming";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

function useSessionSafe() {
    try {
        return useSession();
    } catch {
        return { data: null, status: "unauthenticated" } as any;
    }
}

interface GroomingPageClientProps {
    prices?: typeof PRICES;
}

export function GroomingPageClient({ prices = PRICES }: GroomingPageClientProps) {
    const searchParams = useSearchParams();
    const { data: session, status: authStatus } = useSessionSafe();
    const user = session?.user;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<"dog" | "cat">("dog");
    
    const [formData, setFormData] = useState({
        petType: "dog" as "dog" | "cat",
        petName: "",
        breedSize: "",
        package: "",
        appointmentDate: "",
        appointmentTime: "",
        customerName: "",
        customerPhone: "",
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                customerName: prev.customerName || user.name || "",
            }));
        }
    }, [user]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateStr = e.target.value;
        if (!dateStr) {
            setFormData({ ...formData, appointmentDate: "" });
            return;
        }
        const date = new Date(dateStr);
        if (date.getDay() === 0) {
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
                    bookingNumber = `GRM-OFF-${Date.now().toString(36).toUpperCase()}`;
                    toast.success('Redirecting to WhatsApp...', { id: toastId });
                }
            } catch (err) {
                bookingNumber = `GRM-OFF-${Date.now().toString(36).toUpperCase()}`;
                toast.success('Redirecting to WhatsApp...', { id: toastId });
            }

            const pkgName = formData.package === 'standard' ? 'Essential Package' :
                            formData.package === 'premium' ? 'Premium Package' :
                            formData.package === 'super_premium' ? 'Signature Package' : formData.package;
                            
            const sizeLabel = SIZE_LABELS[formData.breedSize] || formData.breedSize;
            const petTypeLabel = formData.petType === 'dog' ? 'Dog 🐕' : 'Cat 🐈';
            const basePrice = prices[formData.petType]?.[formData.package]?.[formData.breedSize] || 0;
            const totalPrice = basePrice;

            let formattedDate = formData.appointmentDate;
            try {
                formattedDate = new Date(formData.appointmentDate).toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                });
            } catch (dateErr) {}
            
            const customerMessage = `Hi Stephan's Pet Store!\n` +
                   `I want to book a grooming appointment:\n\n` +
                   `*GROOMING APPOINTMENT BOOKING*\n` +
                   `----------------------------------\n` +
                   `*Booking Ref:* #${bookingNumber}\n` +
                   `*Customer Name:* ${formData.customerName}\n` +
                   `*Phone Number:* ${formData.customerPhone}\n\n` +
                   `*PET DETAILS*\n` +
                   `*Pet Name:* ${formData.petName} (${formData.petType === 'dog' ? 'Dog' : 'Cat'})\n` +
                   `*Breed Size:* ${sizeLabel}\n\n` +
                   `*SERVICE DETAILS*\n` +
                   `*Selected Package:* ${pkgName}\n` +
                   `*Preferred Date:* ${formattedDate}\n` +
                   `*Preferred Time:* ${formData.appointmentTime}\n\n` +
                   `*PRICE SUMMARY*\n` +
                   `  - Package Price: ${formatPrice(basePrice)}\n` +
                   `----------------------------------\n` +
                   `*Total Amount:* ${formatPrice(totalPrice)}\n\n`;

            const encodedMessage = encodeURIComponent(customerMessage);
            const whatsappUrl = `https://wa.me/255769324445?text=${encodedMessage}`;
            window.location.href = whatsappUrl;
        } catch (err: any) {
            toast.error(err.message || "An unexpected error occurred", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getMinPrice = (pkgKey: string) => {
        const pkgPrices = prices[activeTab][pkgKey];
        if (!pkgPrices) return 0;
        return Math.min(...Object.values(pkgPrices));
    };

    const packages = [
        {
            key: "standard",
            name: "Essential",
            desc: "Fresh care for regular maintenance.",
            icon: <Paintbrush className="w-8 h-8 text-[#6b3e1e]" strokeWidth={1.5} />,
            popular: false
        },
        {
            key: "premium",
            name: "Premium",
            desc: "Complete care for a healthier, happier pet.",
            icon: <Scissors className="w-8 h-8 text-[#6b3e1e]" strokeWidth={1.5} />,
            popular: true
        },
        {
            key: "super_premium",
            name: "Signature",
            desc: "The ultimate grooming experience at Stephan's.",
            icon: <Wand2 className="w-8 h-8 text-[#6b3e1e]" strokeWidth={1.5} />,
            popular: false
        }
    ];

    return (
        <div className="min-h-screen bg-[#F8F5F0] text-[#2A2A2A] font-sans selection:bg-[#6b3e1e]/20">
            {/* Header Section */}
            <div className="pt-24 pb-12 px-4 text-center">
                <p className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-[#6b3e1e] uppercase mb-6">Pet Grooming Studio</p>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-[#222222] leading-[1.1] mb-12">
                    Gentle care.<br />Professional grooming.
                </h1>

                {/* Tabs */}
                <div className="flex justify-center items-center gap-8 md:gap-16 border-b border-[#E8E0D8] max-w-md mx-auto pb-4">
                    <button 
                        onClick={() => { setActiveTab("dog"); setFormData(f => ({ ...f, petType: "dog" })) }}
                        className={`flex items-center gap-3 text-lg font-medium transition-colors relative ${activeTab === 'dog' ? 'text-[#222]' : 'text-[#888]'}`}
                    >
                        <Image src="/icons/icon-dog.png" alt="Dog" width={24} height={24} className={activeTab === 'dog' ? 'opacity-100' : 'opacity-40 grayscale'} />
                        Dogs
                        {activeTab === 'dog' && <div className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-[#6b3e1e]"></div>}
                    </button>
                    <div className="w-px h-8 bg-[#E8E0D8]"></div>
                    <button 
                        onClick={() => { setActiveTab("cat"); setFormData(f => ({ ...f, petType: "cat" })) }}
                        className={`flex items-center gap-3 text-lg font-medium transition-colors relative ${activeTab === 'cat' ? 'text-[#222]' : 'text-[#888]'}`}
                    >
                        <Image src="/icons/icon-cat.png" alt="Cat" width={24} height={24} className={activeTab === 'cat' ? 'opacity-100' : 'opacity-40 grayscale'} />
                        Cats
                        {activeTab === 'cat' && <div className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-[#6b3e1e]"></div>}
                    </button>
                </div>
            </div>

            {/* Packages Section */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <p className="text-[10px] font-bold tracking-[0.15em] text-[#6b3e1e] uppercase text-center mb-10">Choose your grooming experience</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {packages.map((pkg) => (
                        <div key={pkg.key} className={`relative border border-[#E8E0D8] rounded-2xl p-8 md:p-10 text-center bg-[#FDFBF9] hover:shadow-lg transition-shadow duration-300 flex flex-col items-center justify-between`}>
                            {pkg.popular && (
                                <div className="absolute top-4 right-4 bg-[#6b3e1e] text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase">
                                    Most Popular
                                </div>
                            )}
                            <div className="mb-6 flex justify-center items-center h-16">
                                {pkg.icon}
                            </div>
                            <h3 className="text-2xl font-serif text-[#222] mb-4">{pkg.name}</h3>
                            <p className="text-sm text-[#666] mb-8 max-w-[200px] mx-auto leading-relaxed">{pkg.desc}</p>
                            
                            <div className="w-8 h-px bg-[#E8E0D8] mx-auto mb-8"></div>
                            
                            <div className="mb-8">
                                <p className="text-xs text-[#666] mb-1">Starting from</p>
                                <p className="text-xl font-serif text-[#222]">{formatPrice(getMinPrice(pkg.key))}</p>
                            </div>

                            <button 
                                onClick={() => {
                                    setFormData(f => ({ ...f, package: pkg.key }));
                                    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="text-xs font-bold tracking-widest text-[#6b3e1e] uppercase flex items-center gap-2 hover:text-[#4a2a14] transition-colors"
                            >
                                View Details <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Booking Form Section */}
            <div id="booking-form" className="max-w-5xl mx-auto px-4 py-16">
                <p className="text-[10px] font-bold tracking-[0.15em] text-[#6b3e1e] uppercase text-center mb-4">Book Appointment</p>
                <h2 className="text-4xl md:text-5xl font-serif text-[#222] text-center mb-12">Let's pamper your pet.</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            required
                            placeholder="Pet Name"
                            value={formData.petName}
                            onChange={e => setFormData({ ...formData, petName: e.target.value })}
                            className="w-full bg-white/50 border border-[#E8E0D8] rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#6b3e1e]"
                        />
                        <select
                            value={formData.petType}
                            onChange={e => setFormData({ ...formData, petType: e.target.value as any })}
                            className="w-full bg-white/50 border border-[#E8E0D8] rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#6b3e1e] appearance-none"
                        >
                            <option value="dog">Dog</option>
                            <option value="cat">Cat</option>
                        </select>
                        
                        <select
                            required
                            value={formData.breedSize}
                            onChange={e => setFormData({ ...formData, breedSize: e.target.value })}
                            className="w-full bg-white/50 border border-[#E8E0D8] rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#6b3e1e] appearance-none"
                        >
                            <option value="" disabled>Breed Size</option>
                            {BREED_SIZES[formData.petType].map(size => (
                                <option key={size.value} value={size.value}>{size.label}</option>
                            ))}
                        </select>

                        <select
                            required
                            value={formData.package}
                            onChange={e => setFormData({ ...formData, package: e.target.value })}
                            className="w-full bg-white/50 border border-[#E8E0D8] rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#6b3e1e] appearance-none"
                        >
                            <option value="" disabled>Service Package</option>
                            <option value="standard">Essential</option>
                            <option value="premium">Premium</option>
                            <option value="super_premium">Signature</option>
                        </select>

                        <div className="relative">
                            <input
                                type="date"
                                required
                                value={formData.appointmentDate}
                                onChange={handleDateChange}
                                className="w-full bg-white/50 border border-[#E8E0D8] rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#6b3e1e]"
                            />
                            <CalendarIcon className="w-4 h-4 text-[#888] absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        <select
                            required
                            value={formData.appointmentTime}
                            onChange={e => setFormData({ ...formData, appointmentTime: e.target.value })}
                            className="w-full bg-white/50 border border-[#E8E0D8] rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#6b3e1e] appearance-none"
                        >
                            <option value="" disabled>Time</option>
                            {VALID_TIMES.map(time => (
                                <option key={time.value} value={time.value}>{time.label}</option>
                            ))}
                        </select>

                        <input
                            type="text"
                            required
                            placeholder="Your Name"
                            value={formData.customerName}
                            onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                            className="w-full bg-white/50 border border-[#E8E0D8] rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#6b3e1e]"
                        />

                        <input
                            type="tel"
                            required
                            placeholder="Phone Number"
                            value={formData.customerPhone}
                            onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                            className="w-full bg-white/50 border border-[#E8E0D8] rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#6b3e1e]"
                        />
                    </div>

                    <div className="mt-8 bg-[#F4F0EB] rounded-2xl p-6 md:p-10 flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                        <div className="md:w-1/3">
                            <div className="w-16 h-16 bg-[#EBE4DC] rounded-full flex items-center justify-center mb-6">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b3e1e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                            </div>
                            <h3 className="text-xl font-serif text-[#222] mb-3">Before your visit</h3>
                            <p className="text-sm text-[#666] leading-relaxed">
                                To keep every pet safe and comfortable, please review the important guidelines before booking.
                            </p>
                        </div>
                        <div className="md:w-2/3 space-y-4 pt-2">
                            {[
                                "Arrive 10 minutes early for check-in.",
                                "Please notify us of any medical conditions.",
                                "We may recommend de-matting or handling services where necessary.",
                                "Pick-up within one hour after notification.",
                                "Aggressive pets may require additional handling."
                            ].map((text, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <Check className="w-4 h-4 text-[#6b3e1e] mt-1 shrink-0" />
                                    <span className="text-sm text-[#444] leading-relaxed">{text}</span>
                                </div>
                            ))}

                            <div className="mt-8 pt-6 border-t border-[#E8E0D8] flex items-center justify-between">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" required className="w-4 h-4 accent-[#6b3e1e] rounded" />
                                    <span className="text-sm text-[#444]">I have read and agree to Stephan's Grooming Policy.</span>
                                </label>
                                <button type="button" className="text-xs font-bold text-[#6b3e1e] uppercase flex items-center gap-1 hover:underline">
                                    Read full policy <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#4E2A15] hover:bg-[#3A1F0F] text-white py-5 rounded-xl text-sm font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? "Processing..." : "Book Appointment"}
                            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </div>
                </form>
            </div>

            {/* Bottom Image Section */}
            <div className="relative w-full h-[400px] md:h-[500px]">
                <Image 
                    src="/grooming-dog.jpeg"
                    alt="Happy Pet, Happy Home"
                    fill
                    className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-12 right-12 text-white">
                    <h2 className="text-4xl md:text-5xl font-serif leading-tight text-shadow-sm">
                        Happy Pet,<br />Happy Home.
                    </h2>
                    <div className="w-16 h-px bg-white/50 mt-6"></div>
                </div>
            </div>
        </div>
    );
}
