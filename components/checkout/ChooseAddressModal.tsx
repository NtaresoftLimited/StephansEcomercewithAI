"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserAddress } from "@/lib/address-book";
import { Plus, Check, MapPin, Edit3 } from "lucide-react";

interface ChooseAddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addresses: UserAddress[];
  selectedAddressId: string;
  onSelect: (addressId: string) => void;
  onAddNew: () => void;
  onEdit: (address: UserAddress) => void;
  title?: string;
}

export function ChooseAddressModal({
  open,
  onOpenChange,
  addresses,
  selectedAddressId,
  onSelect,
  onAddNew,
  onEdit,
  title = "Choose Address",
}: ChooseAddressModalProps) {
  const [tempSelectedId, setTempSelectedId] = useState(selectedAddressId);

  // Sync state when opened
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setTempSelectedId(selectedAddressId);
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = () => {
    if (tempSelectedId) {
      onSelect(tempSelectedId);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-6 border-zinc-200">
        <DialogHeader className="border-b border-zinc-100 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold text-zinc-900">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 mt-0.5">
                Select from your saved addresses or add a new delivery location
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-3">
          {addresses.length === 0 ? (
            <div className="py-8 text-center text-zinc-500">
              <MapPin className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
              <p className="text-xs sm:text-sm">No saved addresses yet.</p>
              <Button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onAddNew();
                }}
                className="mt-3 rounded-xl bg-[#3e220f] hover:bg-[#2a170a] text-white text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Your First Address
              </Button>
            </div>
          ) : (
            addresses.map((addr) => {
              const isSelected = tempSelectedId === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => setTempSelectedId(addr.id)}
                  className={`group relative flex items-start justify-between rounded-xl border p-4 transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#3e220f] bg-zinc-50/80 shadow-xs"
                      : "border-zinc-200/90 bg-white hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white">
                      {isSelected && (
                        <div className="h-2.5 w-2.5 rounded-full bg-[#3e220f]" />
                      )}
                    </div>
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-900">
                          {addr.firstName} {addr.lastName}
                        </span>
                        {addr.isDefaultShipping && (
                          <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600">
                            Default Shipping
                          </span>
                        )}
                        {addr.isDefaultBilling && (
                          <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600">
                            Default Billing
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        {addr.address}
                        {addr.area ? `, ${addr.area}` : ""}
                        {addr.city ? `, ${addr.city}` : ""}
                        {addr.country ? `, ${addr.country}` : ""}
                      </p>
                      <p className="text-xs font-medium text-zinc-500">
                        {addr.phone}
                        {addr.email ? ` • ${addr.email}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(addr);
                      }}
                      className="h-8 rounded-lg px-2.5 text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 gap-1"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Change</span>
                    </Button>
                  </div>
                </div>
              );
            })
          )}

          {/* Add New Address Trigger */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onAddNew();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 py-3 text-xs font-bold text-[#3e220f] hover:bg-zinc-100/60 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Address</span>
            </button>
          </div>
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
            type="button"
            onClick={handleConfirm}
            className="rounded-xl bg-[#3e220f] hover:bg-[#2a170a] text-white text-xs font-semibold px-5"
          >
            Select Address
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
