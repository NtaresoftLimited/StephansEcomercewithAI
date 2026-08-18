"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Check, Scissors, Paintbrush, Wand2, ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createGroomingBooking } from "@/lib/actions/grooming";
import { PRICES, BREED_SIZES, VALID_TIMES, SIZE_LABELS, DOG_PACKAGES, CAT_PACKAGES } from "@/lib/constants/grooming";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { GroomingTestimonialsSection } from "@/components/app/grooming/GroomingTestimonialsSection";
import { NewsletterSection } from "@/components/app/grooming/NewsletterSection";

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
            icon: (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
                    <g transform="rotate(-45 24 24)">
                        <rect x="10" y="22" width="26" height="4" rx="2" stroke="#6b3e1e" strokeWidth="1.8"/>
                        <line x1="16" y1="26" x2="16" y2="34" stroke="#6b3e1e" strokeWidth="1.8" strokeLinecap="round"/>
                        <line x1="20" y1="26" x2="20" y2="34" stroke="#6b3e1e" strokeWidth="1.8" strokeLinecap="round"/>
                        <line x1="24" y1="26" x2="24" y2="34" stroke="#6b3e1e" strokeWidth="1.8" strokeLinecap="round"/>
                        <line x1="28" y1="26" x2="28" y2="34" stroke="#6b3e1e" strokeWidth="1.8" strokeLinecap="round"/>
                        <line x1="32" y1="26" x2="32" y2="34" stroke="#6b3e1e" strokeWidth="1.8" strokeLinecap="round"/>
                    </g>
                    <circle cx="14" cy="16" r="2" stroke="#6b3e1e" strokeWidth="1.5"/>
                    <circle cx="20" cy="12" r="1.5" stroke="#6b3e1e" strokeWidth="1.5"/>
                    <path d="M34 32 C36 30, 38 34, 36 36 C34 38, 38 40, 38 40" stroke="#6b3e1e" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                </svg>
            ),
            popular: false
        },
        {
            key: "premium",
            name: "Premium",
            desc: "Complete care for a healthier, happier pet.",
            icon: (
                <div 
                    className="w-16 h-16 bg-[#6b3e1e]"
                    style={{ 
                        maskImage: 'url(/grooming-scissors-bubbles.png)', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
                        WebkitMaskImage: 'url(/grooming-scissors-bubbles.png)', WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center' 
                    }}
                />
            ),
            popular: true
        },
        {
            key: "super_premium",
            name: "Signature",
            desc: "The ultimate grooming experience at Stephan's.",
            icon: (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
                    <g transform="rotate(-45 24 24)">
                        <rect x="12" y="22" width="12" height="4" rx="2" stroke="#6b3e1e" strokeWidth="1.8"/>
                        <rect x="24" y="16" width="14" height="16" rx="2" stroke="#6b3e1e" strokeWidth="1.8"/>
                        <line x1="28" y1="20" x2="28" y2="28" stroke="#6b3e1e" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="31" y1="20" x2="31" y2="28" stroke="#6b3e1e" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="34" y1="20" x2="34" y2="28" stroke="#6b3e1e" strokeWidth="1.5" strokeLinecap="round"/>
                    </g>
                    <circle cx="12" cy="20" r="1.5" stroke="#6b3e1e" strokeWidth="1.5"/>
                    <circle cx="16" cy="14" r="2" stroke="#6b3e1e" strokeWidth="1.5"/>
                    <path d="M36 30 C38 28, 40 32, 38 34 C36 36, 40 38, 40 38" stroke="#6b3e1e" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                </svg>
            ),
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
                        className={`flex items-center gap-3 text-xl font-medium transition-colors relative ${activeTab === 'dog' ? 'text-[#222]' : 'text-[#888]'}`}
                    >
                        <div 
                            className={`w-10 h-10 bg-[#6b3e1e] transition-opacity ${activeTab === 'dog' ? 'opacity-100' : 'opacity-40'}`}
                            style={{ 
                                maskImage: 'url(/minimalist-dog.png)', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
                                WebkitMaskImage: 'url(/minimalist-dog.png)', WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center' 
                            }}
                        />
                        Dogs
                        {activeTab === 'dog' && <div className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-[#6b3e1e]"></div>}
                    </button>
                    <div className="w-px h-8 bg-[#E8E0D8]"></div>
                    <button 
                        onClick={() => { setActiveTab("cat"); setFormData(f => ({ ...f, petType: "cat" })) }}
                        className={`flex items-center gap-3 text-xl font-medium transition-colors relative ${activeTab === 'cat' ? 'text-[#222]' : 'text-[#888]'}`}
                    >
                        <div 
                            className={`w-10 h-10 bg-[#6b3e1e] transition-opacity ${activeTab === 'cat' ? 'opacity-100' : 'opacity-40'}`}
                            style={{ 
                                maskImage: 'url(/minimalist-cat.png)', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
                                WebkitMaskImage: 'url(/minimalist-cat.png)', WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center' 
                            }}
                        />
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
                        <Select
                            value={formData.petType}
                            onValueChange={(value) => setFormData({ ...formData, petType: value as any })}
                        >
                            <SelectTrigger className="w-full bg-white/50 border border-[#E8E0D8] rounded-xl px-5 py-[26px] text-sm focus:outline-none focus:ring-1 focus:ring-[#6b3e1e] shadow-none flex items-center justify-between">
                                <SelectValue placeholder="Select Pet Type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-[#E8E0D8] shadow-lg">
                                <SelectItem value="dog" className="cursor-pointer focus:bg-[#F4F0EB]">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-5 h-5 bg-[#6b3e1e]"
                                            style={{ maskImage: 'url(/minimalist-dog.png)', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskImage: 'url(/minimalist-dog.png)', WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center' }}
                                        />
                                        <span className="text-[15px]">Dog</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="cat" className="cursor-pointer focus:bg-[#F4F0EB]">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-5 h-5 bg-[#6b3e1e]"
                                            style={{ maskImage: 'url(/minimalist-cat.png)', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskImage: 'url(/minimalist-cat.png)', WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center' }}
                                        />
                                        <span className="text-[15px]">Cat</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        
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
                            <Image 
                                src="/calendar-stephans.svg" 
                                alt="Calendar" 
                                width={20} 
                                height={20} 
                                className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none object-contain opacity-50" 
                            />
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

                    {formData.package && formData.breedSize && (
                        <div className="mt-8 p-6 md:p-8 border border-[#E8E0D8] rounded-2xl flex flex-col md:flex-row items-center justify-between bg-white/50 gap-4">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold tracking-widest text-[#6b3e1e] uppercase mb-1">Estimated Total</span>
                                <span className="text-sm text-[#666]">
                                    {formData.petType === 'dog' ? 'Dog' : 'Cat'} • {SIZE_LABELS[formData.breedSize] || formData.breedSize} • {formData.package === 'standard' ? 'Essential' : formData.package === 'premium' ? 'Premium' : 'Signature'} Package
                                </span>
                            </div>
                            <span className="text-3xl md:text-4xl font-serif text-[#222]">
                                {formatPrice(prices[formData.petType]?.[formData.package]?.[formData.breedSize] || 0)}
                            </span>
                        </div>
                    )}

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
            <div 
                className="relative w-full h-[500px] md:h-[600px] bg-fixed bg-cover bg-center flex items-center justify-end px-8 md:px-24 lg:px-32"
                style={{ backgroundImage: 'url(/grooming-dog.jpeg)' }}
            >
                <div className="z-10">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight drop-shadow-lg text-white text-left">
                        Happy Pet,<br />Happy Home.
                    </h2>
                    <div className="w-16 h-[2px] bg-[#6b3e1e] mt-6"></div>
                </div>
            </div>

            <GroomingTestimonialsSection />
            <NewsletterSection />
        </div>
    );
}
