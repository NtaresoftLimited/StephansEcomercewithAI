"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { MapPin, Loader2, Plus, Check } from "lucide-react";
import {
  UserAddress,
  TANZANIA_CITIES,
  DAR_ES_SALAAM_AREAS,
  addAddress,
  updateAddress,
} from "@/lib/address-book";
import { toast } from "sonner";

interface AddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addressToEdit: UserAddress | null;
  onSaved: (address: UserAddress) => void;
  titlePrefix?: string;
}

export function AddressModal({
  open,
  onOpenChange,
  addressToEdit,
  onSaved,
  titlePrefix = "Delivery",
}: AddressModalProps) {
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "Dar es Salaam",
    area: "",
    postalCode: "14111",
    country: "Tanzania",
    isDefaultShipping: true,
    isDefaultBilling: false,
  });

  useEffect(() => {
    if (addressToEdit) {
      setFormData({
        firstName: addressToEdit.firstName || "",
        lastName: addressToEdit.lastName || "",
        phone: addressToEdit.phone || "",
        email: addressToEdit.email || "",
        address: addressToEdit.address || "",
        city: addressToEdit.city || "Dar es Salaam",
        area: addressToEdit.area || "",
        postalCode: addressToEdit.postalCode || "14111",
        country: addressToEdit.country || "Tanzania",
        isDefaultShipping: Boolean(addressToEdit.isDefaultShipping),
        isDefaultBilling: Boolean(addressToEdit.isDefaultBilling),
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        address: "",
        city: "Dar es Salaam",
        area: "",
        postalCode: "14111",
        country: "Tanzania",
        isDefaultShipping: true,
        isDefaultBilling: false,
      });
    }
  }, [addressToEdit, open]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          address: `GPS Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (Driver will call for exact drop-off)`,
        }));
        setLoadingLocation(false);
        toast.success("Current location captured!");
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Unable to retrieve your location");
        setLoadingLocation(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.phone.trim()) {
      toast.error("Please enter a recipient name and phone number");
      return;
    }

    if (!formData.address.trim()) {
      toast.error("Please enter a street address or landmark");
      return;
    }

    try {
      if (addressToEdit?.id) {
        const updated = updateAddress(addressToEdit.id, formData);
        if (updated) {
          toast.success("Address updated successfully");
          onSaved(updated);
          onOpenChange(false);
        }
      } else {
        const created = addAddress(formData);
        toast.success("New address saved to your address book");
        onSaved(created);
        onOpenChange(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save address");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 border-zinc-200">
        <DialogHeader className="border-b border-zinc-100 pb-3">
          <DialogTitle className="text-lg font-bold text-zinc-900">
            {addressToEdit ? `Edit ${titlePrefix} Address` : `Add New ${titlePrefix} Address`}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Provide delivery details for accurate order fulfillment across Tanzania
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Recipient Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="addr-firstName" className="text-xs font-semibold text-zinc-700">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="addr-firstName"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="e.g. Stephano"
                className="h-10 text-sm rounded-xl border-zinc-200"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="addr-lastName" className="text-xs font-semibold text-zinc-700">
                Last Name
              </Label>
              <Input
                id="addr-lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="e.g. Mhando"
                className="h-10 text-sm rounded-xl border-zinc-200"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="addr-phone" className="text-xs font-semibold text-zinc-700">
                Phone Number (WhatsApp) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="addr-phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+255 766 946 712"
                className="h-10 text-sm rounded-xl border-zinc-200"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="addr-email" className="text-xs font-semibold text-zinc-700">
                Email Address (Optional)
              </Label>
              <Input
                id="addr-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="customer@example.com"
                className="h-10 text-sm rounded-xl border-zinc-200"
              />
            </div>
          </div>

          {/* Street Address & GPS Trigger */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="addr-address" className="text-xs font-semibold text-zinc-700">
                Street Address / Landmark <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getUserLocation}
                disabled={loadingLocation}
                className="h-6 text-[11px] gap-1 px-2 border-zinc-200 text-zinc-600 hover:text-zinc-900"
              >
                {loadingLocation ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <MapPin className="h-3 w-3 text-red-500" />
                )}
                Use GPS Pin
              </Button>
            </div>
            <textarea
              id="addr-address"
              name="address"
              required
              rows={2}
              value={formData.address}
              onChange={handleInputChange}
              placeholder="e.g. 11 Slipway Rd, Masaki or Plot 45, Near Shoppers Plaza"
              className="w-full text-sm rounded-xl border border-zinc-200 p-2.5 focus:border-[#3e220f] focus:outline-none"
            />
          </div>

          {/* City & Area / Neighborhood */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="addr-city" className="text-xs font-semibold text-zinc-700">
                City <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.city}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, city: val }))}
              >
                <SelectTrigger id="addr-city" className="h-10 text-sm rounded-xl border-zinc-200">
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
              <Label htmlFor="addr-area" className="text-xs font-semibold text-zinc-700">
                Area / Neighborhood
              </Label>
              {formData.city === "Dar es Salaam" ? (
                <Select
                  value={formData.area}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, area: val }))}
                >
                  <SelectTrigger id="addr-area" className="h-10 text-sm rounded-xl border-zinc-200">
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
                  id="addr-area"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="e.g. Njiro, Makunganya"
                  className="h-10 text-sm rounded-xl border-zinc-200"
                />
              )}
            </div>
          </div>

          {/* Country & Postal Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-zinc-700">Country</Label>
              <Input
                disabled
                value="Tanzania"
                className="h-10 text-sm rounded-xl bg-zinc-50 border-zinc-200 text-zinc-600"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="addr-postalCode" className="text-xs font-semibold text-zinc-700">
                Postal Code
              </Label>
              <Input
                id="addr-postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                placeholder="14111"
                className="h-10 text-sm rounded-xl border-zinc-200"
              />
            </div>
          </div>

          {/* Defaults Checkboxes */}
          <div className="pt-2 border-t border-zinc-100 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700">
              <input
                type="checkbox"
                checked={formData.isDefaultShipping}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isDefaultShipping: e.target.checked,
                  }))
                }
                className="rounded border-zinc-300 text-[#3e220f] focus:ring-[#3e220f]"
              />
              <span>Set as default shipping address</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700">
              <input
                type="checkbox"
                checked={formData.isDefaultBilling}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isDefaultBilling: e.target.checked,
                  }))
                }
                className="rounded border-zinc-300 text-[#3e220f] focus:ring-[#3e220f]"
              />
              <span>Set as default billing address</span>
            </label>
          </div>

          <DialogFooter className="pt-3 border-t border-zinc-100 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-zinc-200 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-[#3e220f] hover:bg-[#2a170a] text-white text-xs font-semibold px-5"
            >
              {addressToEdit ? "Update Address" : "Save Address"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
