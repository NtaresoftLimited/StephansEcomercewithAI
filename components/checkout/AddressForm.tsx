"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { MapPin, Loader2, Check, Truck, Store, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SAVED_ADDRESS_STORAGE_KEY } from "@/components/portal/CustomerPortalClient";

const CITIES = [
  "Dar es Salaam",
  "Arusha",
  "Dodoma",
  "Mwanza",
  "Zanzibar",
  "Mbeya",
  "Morogoro",
  "Tanga",
  "Moshi",
  "Other",
];

interface AddressFormProps {
  onComplete: (data: any) => void;
  isProcessing?: boolean;
}

export function AddressForm({ onComplete, isProcessing }: AddressFormProps) {
  const { data: session } = useSession();
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "Dar es Salaam",
    region: "",
    deliveryMethod: "home_delivery" as
      | "home_delivery"
      | "pickup_masaki"
      | "pickup_mikocheni",
    paymentMethod: "mobile_money_whatsapp" as
      | "mobile_money_whatsapp"
      | "cash_or_card_on_delivery",
  });

  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(SAVED_ADDRESS_STORAGE_KEY);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw);
        setFormData((prev) => ({
          ...prev,
          firstName: saved.firstName || prev.firstName,
          lastName: saved.lastName || prev.lastName,
          email: saved.email || prev.email,
          phone: saved.phone || prev.phone,
          address: saved.address || prev.address,
          city: saved.city || prev.city,
          region: saved.region || prev.region,
          deliveryMethod: saved.deliveryMethod || prev.deliveryMethod,
        }));
      }
    } catch {
      // Ignore storage read errors
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      const rawName = (session.user.name || "").trim();
      const isPlaceholderName =
        rawName.startsWith("Customer (") || rawName === "Guest Shopper";
      const nameParts = isPlaceholderName ? [] : rawName.split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      const rawEmail = session.user.email || "";
      const cleanEmail = rawEmail.endsWith("@whatsapp.stephanspetstore.co.tz")
        ? ""
        : rawEmail;
      const phone = (session.user as any).phone || "";

      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || firstName,
        lastName: prev.lastName || lastName,
        email: prev.email || cleanEmail,
        phone: prev.phone || phone,
      }));
    }
  }, [session]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCityChange = (value: string) => {
    setFormData((prev) => ({ ...prev, city: value }));
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          address: `Current Location: ${latitude}, ${longitude} (Driver will call for exact drop-off)`,
        }));
        setLoadingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location");
        setLoadingLocation(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      alert("Please fill in your name and phone number.");
      return;
    }

    try {
      localStorage.setItem(
        SAVED_ADDRESS_STORAGE_KEY,
        JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          region: formData.region,
          deliveryMethod: formData.deliveryMethod,
        })
      );
    } catch {
      // Ignore storage write errors
    }

    onComplete(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {/* SECTION 1: CUSTOMER & CONTACT INFO */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-200/80 pb-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3e220f] text-xs font-bold text-white">
            1
          </span>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-900">
            Customer & Contact Info
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              name="firstName"
              required
              placeholder="John"
              value={formData.firstName}
              onChange={handleInputChange}
              className="h-11 bg-white border-zinc-200/80 rounded-xl shadow-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              name="lastName"
              required
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleInputChange}
              className="h-11 bg-white border-zinc-200/80 rounded-xl shadow-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number (WhatsApp) *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="+255..."
              value={formData.phone}
              onChange={handleInputChange}
              className="h-11 bg-white border-zinc-200/80 rounded-xl shadow-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleInputChange}
              className="h-11 bg-white border-zinc-200/80 rounded-xl shadow-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: DELIVERY OR STORE PICKUP */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-200/80 pb-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3e220f] text-xs font-bold text-white">
            2
          </span>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-900">
            Delivery or Branch Pickup
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              id: "home_delivery",
              title: "Home Delivery",
              desc: "Doorstep delivery in DSM & Upcountry",
              icon: Truck,
            },
            {
              id: "pickup_masaki",
              title: "Pickup: Masaki",
              desc: "11 Slipway Rd, Masaki",
              icon: Store,
            },
            {
              id: "pickup_mikocheni",
              title: "Pickup: Mikocheni",
              desc: "59 Mikocheni A, DSM",
              icon: Store,
            },
          ].map((opt) => {
            const Icon = opt.icon;
            const selected = formData.deliveryMethod === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    deliveryMethod: opt.id as any,
                  }))
                }
                className={`rounded-xl border p-3.5 text-left transition-colors cursor-pointer ${
                  selected
                    ? "border-[#3e220f] bg-zinc-50"
                    : "border-zinc-200/80 bg-white hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                    <Icon className="h-3.5 w-3.5 text-zinc-700" />
                    {opt.title}
                  </span>
                  {selected && <Check className="h-4 w-4 text-zinc-900" />}
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">{opt.desc}</p>
              </button>
            );
          })}
        </div>

        {formData.deliveryMethod === "home_delivery" && (
          <>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="address">Delivery Street / Landmark</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getUserLocation}
                  disabled={loadingLocation}
                  className="h-7 text-xs gap-1.5 border-zinc-200 hover:bg-zinc-50 shadow-none"
                >
                  {loadingLocation ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <MapPin className="h-3 w-3" />
                  )}
                  Use Current Location
                </Button>
              </div>
              <Input
                id="address"
                name="address"
                placeholder="Street address, apartment, building, or landmark"
                value={formData.address}
                onChange={handleInputChange}
                className="h-11 bg-white border-zinc-200/80 rounded-xl shadow-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Select onValueChange={handleCityChange} value={formData.city}>
                  <SelectTrigger className="h-11 bg-white border-zinc-200/80 rounded-xl shadow-none">
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="region">Area / Neighborhood (Optional)</Label>
                <Input
                  id="region"
                  name="region"
                  placeholder="e.g. Masaki, Mikocheni, Upanga"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="h-11 bg-white border-zinc-200/80 rounded-xl shadow-none"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* SECTION 3: PAYMENT METHOD */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-200/80 pb-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3e220f] text-xs font-bold text-white">
            3
          </span>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-900">
            Payment Preference
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            {
              id: "mobile_money_whatsapp",
              title: "M-Pesa / Luku / Bank Transfer",
              desc: "Instant Lipa namba & payment confirmation on WhatsApp",
            },
            {
              id: "cash_or_card_on_delivery",
              title: "Cash or Card on Delivery / Pickup",
              desc: "Pay upon receiving your order or at our store POS",
            },
          ].map((pm) => {
            const selected = formData.paymentMethod === pm.id;
            return (
              <button
                key={pm.id}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentMethod: pm.id as any,
                  }))
                }
                className={`rounded-xl border p-3.5 text-left transition-colors cursor-pointer ${
                  selected
                    ? "border-[#3e220f] bg-zinc-50"
                    : "border-zinc-200/80 bg-white hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                    <CreditCard className="h-3.5 w-3.5 text-zinc-700" />
                    {pm.title}
                  </span>
                  {selected && <Check className="h-4 w-4 text-zinc-900" />}
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">{pm.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={isProcessing}
          className="w-full h-12 bg-[#3e220f] hover:bg-[#2a170a] text-white font-semibold text-sm rounded-xl shadow-none transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing Order...
            </>
          ) : (
            <>
              <Image
                src="/whatsapp-official.png"
                alt="WhatsApp"
                width={18}
                height={18}
                className="object-contain"
              />
              <span>Complete Order via WhatsApp</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
