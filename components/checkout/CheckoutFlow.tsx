"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  MapPin,
  Truck,
  Store,
  CreditCard,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit3,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Phone,
} from "lucide-react";
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
import {
  useCartItems,
  useTotalPrice,
  useCartActions,
} from "@/lib/store/cart-store-provider";
import { formatPrice } from "@/lib/utils";
import {
  UserAddress,
  getSavedAddresses,
  addAddress,
  saveAddresses,
  TANZANIA_CITIES,
  DAR_ES_SALAAM_AREAS,
} from "@/lib/address-book";
import { AddressModal } from "./AddressModal";
import { ChooseAddressModal } from "./ChooseAddressModal";
import { toast } from "sonner";

export function CheckoutFlow() {
  const { data: session } = useSession();
  const cartItems = useCartItems();
  const totalPrice = useTotalPrice();
  const { clearCart } = useCartActions();

  // Accordion section open/collapse states
  const [openSections, setOpenSections] = useState({
    shipping: true,
    delivery: true,
    payment: true,
  });

  // Active address book
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string>("");
  const [selectedBillingId, setSelectedBillingId] = useState<string>("");
  const [useSameAsBilling, setUseSameAsBilling] = useState(true);
  const [activeAddressTab, setActiveAddressTab] = useState<"shipping" | "billing">("shipping");

  // Modals state
  const [isChooseModalOpen, setIsChooseModalOpen] = useState(false);
  const [isChooseBillingModalOpen, setIsChooseBillingModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<UserAddress | null>(null);

  // Guest address state (used if user has no saved addresses)
  const [guestAddress, setGuestAddress] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "Dar es Salaam",
    area: "Masaki",
    postalCode: "14111",
    saveAddress: true,
  });
  const [loadingGuestLocation, setLoadingGuestLocation] = useState(false);

  // Fulfillment & Payment state
  const [deliveryType, setDeliveryType] = useState<"home_delivery" | "pickup_point">("home_delivery");
  const [selectedPickupBranch, setSelectedPickupBranch] = useState<"pickup_masaki" | "pickup_mikocheni">("pickup_masaki");
  const [paymentOption, setPaymentOption] = useState<"mobile_money_whatsapp" | "cash_or_card_on_delivery">("mobile_money_whatsapp");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [agreedToPolicies, setAgreedToPolicies] = useState(true);

  // Submission state
  const [isProcessing, setIsProcessing] = useState(false);

  // Load addresses on mount
  useEffect(() => {
    const loaded = getSavedAddresses();
    setAddresses(loaded);

    if (loaded.length > 0) {
      const defaultShipping = loaded.find((a) => a.isDefaultShipping) || loaded[0];
      const defaultBilling = loaded.find((a) => a.isDefaultBilling) || loaded[0];
      setSelectedShippingId(defaultShipping.id);
      setSelectedBillingId(defaultBilling.id);
    }

    const handleSync = () => {
      const updated = getSavedAddresses();
      setAddresses(updated);
    };

    window.addEventListener("sps-address-book-updated", handleSync);
    return () => window.removeEventListener("sps-address-book-updated", handleSync);
  }, []);

  // Pre-fill guest or session info if user is authenticated
  useEffect(() => {
    if (session?.user && addresses.length === 0) {
      const rawName = (session.user.name || "").trim();
      const isPlaceholder = rawName.startsWith("Customer (") || rawName === "Guest Shopper";
      const parts = isPlaceholder ? [] : rawName.split(/\s+/);
      const fName = parts[0] || "";
      const lName = parts.slice(1).join(" ") || "";
      const rawEmail = session.user.email || "";
      const cleanEmail = rawEmail.endsWith("@whatsapp.stephanspetstore.co.tz") ? "" : rawEmail;
      const phone = (session.user as any).phone || "";

      setGuestAddress((prev) => ({
        ...prev,
        firstName: prev.firstName || fName,
        lastName: prev.lastName || lName,
        email: prev.email || cleanEmail,
        phone: prev.phone || phone,
      }));
    }
  }, [session, addresses]);

  const activeShippingAddress = addresses.find((a) => a.id === selectedShippingId) || addresses[0];
  const activeBillingAddress = addresses.find((a) => a.id === selectedBillingId) || addresses[0];

  const toggleSection = (key: "shipping" | "delivery" | "payment") => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getGuestLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLoadingGuestLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGuestAddress((prev) => ({
          ...prev,
          address: `GPS Pin: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (Call customer for exact drop-off)`,
        }));
        setLoadingGuestLocation(false);
        toast.success("Location captured!");
      },
      (error) => {
        console.error(error);
        toast.error("Unable to retrieve GPS location");
        setLoadingGuestLocation(false);
      }
    );
  };

  const handleOrderSubmit = async () => {
    if (!agreedToPolicies) {
      toast.error("Please agree to our terms and conditions to proceed");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Determine final customer details
    let finalCustomer: {
      firstName: string;
      lastName: string;
      phone: string;
      email?: string;
      address?: string;
      city?: string;
      region?: string;
      deliveryMethod: string;
      paymentMethod: string;
      additionalInfo?: string;
    };

    if (addresses.length > 0 && activeShippingAddress) {
      finalCustomer = {
        firstName: activeShippingAddress.firstName,
        lastName: activeShippingAddress.lastName,
        phone: activeShippingAddress.phone,
        email: activeShippingAddress.email,
        address: activeShippingAddress.address,
        city: activeShippingAddress.city,
        region: activeShippingAddress.area,
        deliveryMethod:
          deliveryType === "home_delivery" ? "home_delivery" : selectedPickupBranch,
        paymentMethod: paymentOption,
        additionalInfo: additionalInfo.trim(),
      };
    } else {
      if (!guestAddress.firstName.trim() || !guestAddress.phone.trim()) {
        toast.error("Please provide your name and phone number in Shipping Info");
        setOpenSections((prev) => ({ ...prev, shipping: true }));
        return;
      }
      if (deliveryType === "home_delivery" && !guestAddress.address.trim()) {
        toast.error("Please provide your street address or landmark");
        setOpenSections((prev) => ({ ...prev, shipping: true }));
        return;
      }

      finalCustomer = {
        firstName: guestAddress.firstName,
        lastName: guestAddress.lastName,
        phone: guestAddress.phone,
        email: guestAddress.email,
        address: guestAddress.address,
        city: guestAddress.city,
        region: guestAddress.area,
        deliveryMethod:
          deliveryType === "home_delivery" ? "home_delivery" : selectedPickupBranch,
        paymentMethod: paymentOption,
        additionalInfo: additionalInfo.trim(),
      };

      // Auto-save to address book if selected
      if (guestAddress.saveAddress) {
        addAddress({
          firstName: guestAddress.firstName,
          lastName: guestAddress.lastName,
          phone: guestAddress.phone,
          email: guestAddress.email,
          address: guestAddress.address,
          city: guestAddress.city,
          area: guestAddress.area,
          postalCode: guestAddress.postalCode,
          country: "Tanzania",
          isDefaultShipping: true,
          isDefaultBilling: true,
        });
      }
    }

    setIsProcessing(true);

    try {
      let orderNumber: string | undefined;
      let pdfUrl: string | undefined;

      try {
        const response = await fetch("/api/orders/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: finalCustomer,
            items: cartItems,
            total: totalPrice,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.orderNumber) {
            orderNumber = data.orderNumber;
            pdfUrl = `${window.location.origin}/receipt/${orderNumber}`;
          }
        } else {
          console.error("Order API returned error:", response.status);
        }
      } catch (apiErr) {
        console.error("Order API call failed, proceeding with WhatsApp fallback:", apiErr);
      }

      if (!orderNumber) {
        orderNumber = `SPS-WA-${Date.now().toString(36).toUpperCase()}`;
      }

      const itemLines = cartItems
        .map(
          (item) =>
            `  • ${item.name} × ${item.quantity} — TZS ${(item.price * item.quantity).toLocaleString("en-US")}`
        )
        .join("\n");

      clearCart();

      const receiptLine = pdfUrl ? `\nView my PDF receipt here: ${pdfUrl}` : "";

      const deliveryLabel =
        finalCustomer.deliveryMethod === "pickup_masaki"
          ? "Store Pickup — Masaki Branch (11 Slipway Rd)"
          : finalCustomer.deliveryMethod === "pickup_mikocheni"
          ? "Store Pickup — Mikocheni Branch (59 Mikocheni A)"
          : "Home Delivery (Doorstep DSM / Upcountry)";

      const paymentLabel =
        finalCustomer.paymentMethod === "cash_or_card_on_delivery"
          ? "Cash / Card on Delivery or Pickup"
          : "M-Pesa / Mobile Money / Lipa Namba";

      const customerMessage =
        `Hi Stephan's Pet Store!\n` +
        `I have just placed an order on the website (Order #${orderNumber}).` +
        receiptLine +
        `\n\nItems Ordered:\n${itemLines}` +
        `\n\nTotal: TZS ${totalPrice.toLocaleString("en-US")}` +
        `\n\nFulfillment & Payment:\n` +
        `Delivery: ${deliveryLabel}\n` +
        `Payment: ${paymentLabel}` +
        (finalCustomer.additionalInfo
          ? `\n\nSpecial Instructions / Notes:\n${finalCustomer.additionalInfo}`
          : "") +
        `\n\nCustomer Details:\n` +
        `Name: ${finalCustomer.firstName} ${finalCustomer.lastName}\n` +
        `Phone: ${finalCustomer.phone}` +
        (finalCustomer.address ? `\nAddress: ${finalCustomer.address}` : "") +
        (finalCustomer.region ? `, ${finalCustomer.region}` : "") +
        (finalCustomer.city ? `, ${finalCustomer.city}` : "");

      const encodedMessage = encodeURIComponent(customerMessage);
      const whatsappUrl = `https://wa.me/255769324445?text=${encodedMessage}`;

      window.location.href = whatsappUrl;
    } catch (error) {
      console.error("Order placement failed", error);
      toast.error("Failed to place order. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. SHIPPING INFO ACCORDION CARD                                           */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-zinc-200/90 bg-white shadow-xs overflow-hidden">
        {/* Card Header */}
        <div
          onClick={() => toggleSection("shipping")}
          className="flex items-center justify-between px-6 py-4 cursor-pointer select-none bg-zinc-50/50 hover:bg-zinc-50 transition-colors border-b border-zinc-100"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3e220f] text-xs font-bold text-white">
              1
            </span>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                Shipping Info
              </h2>
              {addresses.length > 0 && activeShippingAddress && (
                <span className="hidden sm:inline-block text-xs text-zinc-400 font-medium">
                  • {activeShippingAddress.firstName} ({activeShippingAddress.city})
                </span>
              )}
            </div>
          </div>
          <div className="text-zinc-500">
            {openSections.shipping ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>

        {/* Card Body */}
        {openSections.shipping && (
          <div className="p-6">
            {/* Tabs: Shipping Address vs Billing Address */}
            <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-2">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => setActiveAddressTab("shipping")}
                  className={`text-xs sm:text-sm font-bold pb-2 transition-all cursor-pointer ${
                    activeAddressTab === "shipping"
                      ? "text-[#3e220f] border-b-2 border-[#3e220f]"
                      : "text-zinc-400 hover:text-zinc-700"
                  }`}
                >
                  Shipping Address
                </button>
                {!useSameAsBilling && (
                  <button
                    type="button"
                    onClick={() => setActiveAddressTab("billing")}
                    className={`text-xs sm:text-sm font-bold pb-2 transition-all cursor-pointer ${
                      activeAddressTab === "billing"
                        ? "text-[#3e220f] border-b-2 border-[#3e220f]"
                        : "text-zinc-400 hover:text-zinc-700"
                    }`}
                  >
                    Billing Address
                  </button>
                )}
              </div>

              {/* Choose Another Address button (if user has saved addresses) */}
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeAddressTab === "shipping") {
                      setIsChooseModalOpen(true);
                    } else {
                      setIsChooseBillingModalOpen(true);
                    }
                  }}
                  className="text-xs font-bold text-[#c77e35] hover:underline cursor-pointer"
                >
                  Choose Another Address
                </button>
              )}
            </div>

            {/* If user has saved addresses: show selected address card */}
            {addresses.length > 0 ? (
              <div>
                {activeAddressTab === "shipping" && activeShippingAddress && (
                  <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/50 p-4 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-400 bg-white">
                          <div className="h-2.5 w-2.5 rounded-full bg-[#3e220f]" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-zinc-900">
                              {activeShippingAddress.firstName} {activeShippingAddress.lastName}
                            </span>
                            {activeShippingAddress.isDefaultShipping && (
                              <span className="rounded-md bg-zinc-200/60 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-600 leading-relaxed">
                            {activeShippingAddress.address}
                            {activeShippingAddress.area ? `, ${activeShippingAddress.area}` : ""}
                            {activeShippingAddress.city ? `, ${activeShippingAddress.city}` : ""}
                            {activeShippingAddress.country ? `, ${activeShippingAddress.country}` : ""}
                          </p>
                          <p className="text-xs font-medium text-zinc-500">
                            {activeShippingAddress.phone}
                            {activeShippingAddress.email ? ` • ${activeShippingAddress.email}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="sm:self-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAddressToEdit(activeShippingAddress);
                            setIsAddressModalOpen(true);
                          }}
                          className="h-8 rounded-full border-zinc-300 px-4 text-xs font-semibold text-zinc-700 hover:bg-white gap-1"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Change</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeAddressTab === "billing" && activeBillingAddress && (
                  <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/50 p-4 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-400 bg-white">
                          <div className="h-2.5 w-2.5 rounded-full bg-[#3e220f]" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-zinc-900">
                              {activeBillingAddress.firstName} {activeBillingAddress.lastName}
                            </span>
                            <span className="rounded-md bg-zinc-200/60 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700">
                              Billing
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 leading-relaxed">
                            {activeBillingAddress.address}
                            {activeBillingAddress.area ? `, ${activeBillingAddress.area}` : ""}
                            {activeBillingAddress.city ? `, ${activeBillingAddress.city}` : ""}
                            {activeBillingAddress.country ? `, ${activeBillingAddress.country}` : ""}
                          </p>
                          <p className="text-xs font-medium text-zinc-500">
                            {activeBillingAddress.phone}
                          </p>
                        </div>
                      </div>

                      <div className="sm:self-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAddressToEdit(activeBillingAddress);
                            setIsAddressModalOpen(true);
                          }}
                          className="h-8 rounded-full border-zinc-300 px-4 text-xs font-semibold text-zinc-700 hover:bg-white gap-1"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Change</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-bar: Use as billing address toggle + Add New Address */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700 select-none">
                    <input
                      type="checkbox"
                      checked={useSameAsBilling}
                      onChange={(e) => {
                        setUseSameAsBilling(e.target.checked);
                        if (e.target.checked) {
                          setActiveAddressTab("shipping");
                        }
                      }}
                      className="rounded border-zinc-300 text-[#3e220f] focus:ring-[#3e220f]"
                    />
                    <span>Use this as billing address</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setAddressToEdit(null);
                      setIsAddressModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/70 px-4 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add New Address</span>
                  </button>
                </div>
              </div>
            ) : (
              /* If guest / no saved addresses: show inline guest shipping inputs */
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="guest-firstName" className="text-xs font-semibold text-zinc-700">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="guest-firstName"
                      required
                      placeholder="e.g. Stephano"
                      value={guestAddress.firstName}
                      onChange={(e) =>
                        setGuestAddress((prev) => ({ ...prev, firstName: e.target.value }))
                      }
                      className="h-10 text-sm rounded-xl border-zinc-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="guest-lastName" className="text-xs font-semibold text-zinc-700">
                      Last Name
                    </Label>
                    <Input
                      id="guest-lastName"
                      placeholder="e.g. Mhando"
                      value={guestAddress.lastName}
                      onChange={(e) =>
                        setGuestAddress((prev) => ({ ...prev, lastName: e.target.value }))
                      }
                      className="h-10 text-sm rounded-xl border-zinc-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="guest-phone" className="text-xs font-semibold text-zinc-700">
                      Phone Number (WhatsApp) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="guest-phone"
                      type="tel"
                      required
                      placeholder="+255 766 946 712"
                      value={guestAddress.phone}
                      onChange={(e) =>
                        setGuestAddress((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className="h-10 text-sm rounded-xl border-zinc-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="guest-email" className="text-xs font-semibold text-zinc-700">
                      Email Address (Optional)
                    </Label>
                    <Input
                      id="guest-email"
                      type="email"
                      placeholder="customer@example.com"
                      value={guestAddress.email}
                      onChange={(e) =>
                        setGuestAddress((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="h-10 text-sm rounded-xl border-zinc-200"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="guest-address" className="text-xs font-semibold text-zinc-700">
                      Street Address / Landmark <span className="text-red-500">*</span>
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getGuestLocation}
                      disabled={loadingGuestLocation}
                      className="h-6 text-[11px] gap-1 px-2 border-zinc-200 text-zinc-600 hover:text-zinc-900"
                    >
                      {loadingGuestLocation ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <MapPin className="h-3 w-3 text-red-500" />
                      )}
                      Use GPS Location
                    </Button>
                  </div>
                  <textarea
                    id="guest-address"
                    rows={2}
                    required
                    placeholder="e.g. 11 Slipway Rd, Masaki or Plot 45, Near Shoppers Plaza"
                    value={guestAddress.address}
                    onChange={(e) =>
                      setGuestAddress((prev) => ({ ...prev, address: e.target.value }))
                    }
                    className="w-full text-sm rounded-xl border border-zinc-200 p-2.5 focus:border-[#3e220f] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="guest-city" className="text-xs font-semibold text-zinc-700">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={guestAddress.city}
                      onValueChange={(val) =>
                        setGuestAddress((prev) => ({ ...prev, city: val }))
                      }
                    >
                      <SelectTrigger id="guest-city" className="h-10 text-sm rounded-xl border-zinc-200">
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent>
                        {TANZANIA_CITIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="guest-area" className="text-xs font-semibold text-zinc-700">
                      Area / Neighborhood
                    </Label>
                    {guestAddress.city === "Dar es Salaam" ? (
                      <Select
                        value={guestAddress.area}
                        onValueChange={(val) =>
                          setGuestAddress((prev) => ({ ...prev, area: val }))
                        }
                      >
                        <SelectTrigger id="guest-area" className="h-10 text-sm rounded-xl border-zinc-200">
                          <SelectValue placeholder="Select Area" />
                        </SelectTrigger>
                        <SelectContent>
                          {DAR_ES_SALAAM_AREAS.map((a) => (
                            <SelectItem key={a} value={a}>
                              {a}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="guest-area"
                        value={guestAddress.area}
                        onChange={(e) =>
                          setGuestAddress((prev) => ({ ...prev, area: e.target.value }))
                        }
                        placeholder="e.g. Njiro, Makunganya"
                        className="h-10 text-sm rounded-xl border-zinc-200"
                      />
                    )}
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700 pt-1 select-none">
                  <input
                    type="checkbox"
                    checked={guestAddress.saveAddress}
                    onChange={(e) =>
                      setGuestAddress((prev) => ({ ...prev, saveAddress: e.target.checked }))
                    }
                    className="rounded border-zinc-300 text-[#3e220f] focus:ring-[#3e220f]"
                  />
                  <span>Save this address for fast 1-click checkout in the future</span>
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. DELIVERY INFO ACCORDION CARD (FULFILLMENT)                             */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-zinc-200/90 bg-white shadow-xs overflow-hidden">
        {/* Card Header */}
        <div
          onClick={() => toggleSection("delivery")}
          className="flex items-center justify-between px-6 py-4 cursor-pointer select-none bg-zinc-50/50 hover:bg-zinc-50 transition-colors border-b border-zinc-100"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3e220f] text-xs font-bold text-white">
              2
            </span>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                Delivery Info
              </h2>
              <span className="text-xs text-zinc-400 font-medium">
                • {deliveryType === "home_delivery" ? "Home Delivery" : "Store Pickup"}
              </span>
            </div>
          </div>
          <div className="text-zinc-500">
            {openSections.delivery ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>

        {/* Card Body */}
        {openSections.delivery && (
          <div className="p-6 space-y-5">
            {/* Cart products preview (similar to Dukanikwetu delivery_info_details) */}
            <div className="border border-zinc-100 rounded-xl p-3 bg-zinc-50/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                Items In This Package ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
              </span>
              <div className="flex flex-wrap gap-3">
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-2 bg-white rounded-lg border border-zinc-200/80 p-2 pr-3"
                  >
                    <div className="h-10 w-10 shrink-0 relative bg-zinc-50 rounded overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-0.5"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] text-zinc-400">
                          🐾
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-zinc-800 line-clamp-1 max-w-[150px]">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        Qty: <span className="font-bold text-zinc-700">{item.quantity}</span> • {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Choose Delivery Type */}
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-zinc-900 mb-3 uppercase tracking-wide">
                Choose Delivery Type
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Home Delivery */}
                <label
                  onClick={() => setDeliveryType("home_delivery")}
                  className={`flex items-start gap-3 rounded-xl border p-4 transition-all cursor-pointer ${
                    deliveryType === "home_delivery"
                      ? "border-[#3e220f] bg-zinc-50/80 shadow-xs"
                      : "border-zinc-200/90 bg-white hover:border-zinc-300"
                  }`}
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-400 bg-white">
                    {deliveryType === "home_delivery" && (
                      <div className="h-2.5 w-2.5 rounded-full bg-[#3e220f]" />
                    )}
                  </div>
                  <div className="space-y-0.5 text-left">
                    <span className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-zinc-900">
                      <Truck className="h-4 w-4 text-zinc-700" />
                      Home Delivery
                    </span>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Doorstep delivery in Dar es Salaam & Upcountry regions
                    </p>
                  </div>
                </label>

                {/* Local Pickup Point */}
                <label
                  onClick={() => setDeliveryType("pickup_point")}
                  className={`flex items-start gap-3 rounded-xl border p-4 transition-all cursor-pointer ${
                    deliveryType === "pickup_point"
                      ? "border-[#3e220f] bg-zinc-50/80 shadow-xs"
                      : "border-zinc-200/90 bg-white hover:border-zinc-300"
                  }`}
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-400 bg-white">
                    {deliveryType === "pickup_point" && (
                      <div className="h-2.5 w-2.5 rounded-full bg-[#3e220f]" />
                    )}
                  </div>
                  <div className="space-y-0.5 text-left">
                    <span className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-zinc-900">
                      <Store className="h-4 w-4 text-zinc-700" />
                      Local Pickup Point
                    </span>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Collect in 30 minutes from our Masaki or Mikocheni store
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* If Local Pickup chosen: Branch selector tiles */}
            {deliveryType === "pickup_point" && (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 block">
                  Select Your Nearest Pickup Point
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: "pickup_masaki" as const,
                      name: "Masaki Branch",
                      address: "11 Slipway Rd, Masaki, Dar es Salaam",
                      phone: "+255 786 627 873",
                      hours: "Mon-Sat: 9:00 AM – 8:30 PM",
                    },
                    {
                      id: "pickup_mikocheni" as const,
                      name: "Mikocheni Branch",
                      address: "59 Mikocheni A, Dar es Salaam",
                      phone: "+255 769 324 445",
                      hours: "Mon-Sat: 9:00 AM – 8:30 PM",
                    },
                  ].map((branch) => {
                    const isSelected = selectedPickupBranch === branch.id;
                    return (
                      <div
                        key={branch.id}
                        onClick={() => setSelectedPickupBranch(branch.id)}
                        className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#3e220f] bg-white shadow-xs ring-1 ring-[#3e220f]"
                            : "border-zinc-200 bg-white hover:border-zinc-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-zinc-900">
                            {branch.name}
                          </span>
                          {isSelected && <Check className="h-4 w-4 text-[#3e220f]" />}
                        </div>
                        <p className="text-[11px] text-zinc-600 flex items-center gap-1 mb-0.5">
                          <MapPin className="h-3 w-3 text-zinc-400 shrink-0" />
                          {branch.address}
                        </p>
                        <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-zinc-400 shrink-0" />
                          {branch.phone} ({branch.hours})
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. PAYMENT & ADDITIONAL INFO ACCORDION CARD                               */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-zinc-200/90 bg-white shadow-xs overflow-hidden">
        {/* Card Header */}
        <div
          onClick={() => toggleSection("payment")}
          className="flex items-center justify-between px-6 py-4 cursor-pointer select-none bg-zinc-50/50 hover:bg-zinc-50 transition-colors border-b border-zinc-100"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3e220f] text-xs font-bold text-white">
              3
            </span>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                Payment
              </h2>
              <span className="text-xs text-zinc-400 font-medium">
                • {paymentOption === "mobile_money_whatsapp" ? "Mobile Money" : "Cash / Card"}
              </span>
            </div>
          </div>
          <div className="text-zinc-500">
            {openSections.payment ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>

        {/* Card Body */}
        {openSections.payment && (
          <div className="p-6 space-y-6">
            {/* Any Additional Info (textarea) */}
            <div className="space-y-1.5">
              <label
                htmlFor="checkout-additional-info"
                className="text-xs sm:text-sm font-bold text-zinc-900 uppercase tracking-wide block"
              >
                Any additional info?
              </label>
              <textarea
                id="checkout-additional-info"
                rows={3}
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Type your notes here... (e.g. pet breed, gate code, call before delivery, preferred drop-off time)"
                className="w-full text-sm rounded-xl border border-zinc-200 p-3 focus:border-[#3e220f] focus:outline-none placeholder:text-zinc-400"
              />
            </div>

            {/* Select a payment option */}
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-zinc-900 mb-3 uppercase tracking-wide">
                Select a payment option
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Mobile Money (M-Pesa, Lipa Namba, Airtel Money, Tigo) */}
                <label
                  onClick={() => setPaymentOption("mobile_money_whatsapp")}
                  className={`flex items-start justify-between rounded-xl border p-4 transition-all cursor-pointer ${
                    paymentOption === "mobile_money_whatsapp"
                      ? "border-[#3e220f] bg-zinc-50/80 shadow-xs"
                      : "border-zinc-200/90 bg-white hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-400 bg-white">
                      {paymentOption === "mobile_money_whatsapp" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-[#3e220f]" />
                      )}
                    </div>
                    <div className="space-y-0.5 text-left">
                      <span className="text-xs sm:text-sm font-bold text-zinc-900 block">
                        Mobile Money / Lipa Namba
                      </span>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">
                        M-Pesa, Airtel Money, Tigo Pesa, or Bank Transfer
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      LIPA
                    </span>
                  </div>
                </label>

                {/* Cash on Delivery / Store Pickup */}
                <label
                  onClick={() => setPaymentOption("cash_or_card_on_delivery")}
                  className={`flex items-start justify-between rounded-xl border p-4 transition-all cursor-pointer ${
                    paymentOption === "cash_or_card_on_delivery"
                      ? "border-[#3e220f] bg-zinc-50/80 shadow-xs"
                      : "border-zinc-200/90 bg-white hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-400 bg-white">
                      {paymentOption === "cash_or_card_on_delivery" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-[#3e220f]" />
                      )}
                    </div>
                    <div className="space-y-0.5 text-left">
                      <span className="text-xs sm:text-sm font-bold text-zinc-900 block">
                        Cash or Card on Delivery
                      </span>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">
                        Pay upon receiving your order or via store POS machine
                      </p>
                    </div>
                  </div>
                  <CreditCard className="h-5 w-5 text-zinc-400 shrink-0" />
                </label>
              </div>
            </div>

            {/* Agree Box */}
            <div className="border-t border-zinc-100 pt-4">
              <label className="flex items-center gap-2.5 text-xs text-zinc-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreedToPolicies}
                  onChange={(e) => setAgreedToPolicies(e.target.checked)}
                  className="rounded border-zinc-300 text-[#3e220f] focus:ring-[#3e220f]"
                />
                <span>
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="font-bold text-zinc-900 hover:underline"
                  >
                    terms and conditions
                  </Link>
                  ,{" "}
                  <Link
                    href="/return-policy"
                    target="_blank"
                    className="font-bold text-zinc-900 hover:underline"
                  >
                    return policy
                  </Link>{" "}
                  &{" "}
                  <Link
                    href="/grooming-policy"
                    target="_blank"
                    className="font-bold text-zinc-900 hover:underline"
                  >
                    store policy
                  </Link>
                </span>
              </label>
            </div>

            {/* Action Row: Return to Shop & Complete Order CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Return to shop
              </Link>

              <Button
                type="button"
                onClick={handleOrderSubmit}
                disabled={isProcessing || !agreedToPolicies}
                className="w-full sm:w-auto h-12 rounded-xl bg-[#3e220f] hover:bg-[#2a170a] px-8 text-xs sm:text-sm font-bold text-white shadow-none transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing Order...</span>
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
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODALS                                                                    */}
      {/* ========================================================================= */}
      {/* 1. Choose Shipping Address Modal */}
      <ChooseAddressModal
        open={isChooseModalOpen}
        onOpenChange={setIsChooseModalOpen}
        addresses={addresses}
        selectedAddressId={selectedShippingId}
        onSelect={(id) => {
          setSelectedShippingId(id);
          toast.success("Shipping address selected");
        }}
        onAddNew={() => {
          setAddressToEdit(null);
          setIsAddressModalOpen(true);
        }}
        onEdit={(addr) => {
          setAddressToEdit(addr);
          setIsAddressModalOpen(true);
        }}
        title="Choose Shipping Address"
      />

      {/* 2. Choose Billing Address Modal */}
      <ChooseAddressModal
        open={isChooseBillingModalOpen}
        onOpenChange={setIsChooseBillingModalOpen}
        addresses={addresses}
        selectedAddressId={selectedBillingId}
        onSelect={(id) => {
          setSelectedBillingId(id);
          toast.success("Billing address selected");
        }}
        onAddNew={() => {
          setAddressToEdit(null);
          setIsAddressModalOpen(true);
        }}
        onEdit={(addr) => {
          setAddressToEdit(addr);
          setIsAddressModalOpen(true);
        }}
        title="Choose Billing Address"
      />

      {/* 3. Add / Edit Address Modal */}
      <AddressModal
        open={isAddressModalOpen}
        onOpenChange={setIsAddressModalOpen}
        addressToEdit={addressToEdit}
        onSaved={(saved) => {
          const updated = getSavedAddresses();
          setAddresses(updated);
          if (addressToEdit) {
            if (selectedShippingId === saved.id) setSelectedShippingId(saved.id);
            if (selectedBillingId === saved.id) setSelectedBillingId(saved.id);
          } else {
            setSelectedShippingId(saved.id);
            if (useSameAsBilling) setSelectedBillingId(saved.id);
          }
        }}
      />
    </div>
  );
}
