export interface UserAddress {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  area?: string;
  postalCode?: string;
  country: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  deliveryMethod?: "home_delivery" | "pickup_masaki" | "pickup_mikocheni";
}

export const ADDRESS_BOOK_STORAGE_KEY = "sps-address-book";
export const LEGACY_ADDRESS_STORAGE_KEY = "sps-default-address";

export const TANZANIA_CITIES = [
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

export const DAR_ES_SALAAM_AREAS = [
  "Masaki",
  "Oysterbay",
  "Mikocheni",
  "Mikocheni A",
  "Mikocheni B",
  "Upanga",
  "City Centre",
  "Kariakoo",
  "Kijitonyama",
  "Sinza",
  "Mwenge",
  "Mbezi Beach",
  "Tegeta",
  "Kunduchi",
  "Bahari Beach",
  "Kawe",
  "Namanga",
  "Ada Estate",
  "Ilala",
  "Temeke",
  "Kigamboni",
  "Other",
];

export function getSavedAddresses(): UserAddress[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(ADDRESS_BOOK_STORAGE_KEY);
    if (raw) {
      const parsed: UserAddress[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Fallback & auto-migration from legacy single address key
    const legacyRaw = localStorage.getItem(LEGACY_ADDRESS_STORAGE_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw);
      if (legacy && (legacy.firstName || legacy.phone || legacy.address)) {
        const migrated: UserAddress = {
          id: "addr_legacy_1",
          firstName: legacy.firstName || "",
          lastName: legacy.lastName || "",
          phone: legacy.phone || "",
          email: legacy.email || "",
          address: legacy.address || "",
          city: legacy.city || "Dar es Salaam",
          area: legacy.region || "",
          postalCode: "14111",
          country: "Tanzania",
          isDefaultShipping: true,
          isDefaultBilling: true,
          deliveryMethod: legacy.deliveryMethod || "home_delivery",
        };
        saveAddresses([migrated]);
        return [migrated];
      }
    }
  } catch (err) {
    console.error("Error reading addresses from localStorage", err);
  }

  return [];
}

export function saveAddresses(addresses: UserAddress[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADDRESS_BOOK_STORAGE_KEY, JSON.stringify(addresses));
    // Also keep legacy key updated with default shipping address for backward compatibility
    const defaultAddr =
      addresses.find((a) => a.isDefaultShipping) || addresses[0];
    if (defaultAddr) {
      localStorage.setItem(
        LEGACY_ADDRESS_STORAGE_KEY,
        JSON.stringify({
          firstName: defaultAddr.firstName,
          lastName: defaultAddr.lastName,
          email: defaultAddr.email || "",
          phone: defaultAddr.phone,
          address: defaultAddr.address,
          city: defaultAddr.city,
          region: defaultAddr.area || "",
          deliveryMethod: defaultAddr.deliveryMethod || "home_delivery",
        })
      );
    }
    // Dispatch storage event to keep tabs/components in sync
    window.dispatchEvent(new Event("sps-address-book-updated"));
  } catch (err) {
    console.error("Error saving addresses to localStorage", err);
  }
}

export function addAddress(
  data: Omit<UserAddress, "id">
): UserAddress {
  const current = getSavedAddresses();
  const id = `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const isFirst = current.length === 0;

  const newAddress: UserAddress = {
    ...data,
    id,
    isDefaultShipping: isFirst ? true : Boolean(data.isDefaultShipping),
    isDefaultBilling: isFirst ? true : Boolean(data.isDefaultBilling),
  };

  const updated = current.map((addr) => {
    return {
      ...addr,
      isDefaultShipping: newAddress.isDefaultShipping
        ? false
        : addr.isDefaultShipping,
      isDefaultBilling: newAddress.isDefaultBilling
        ? false
        : addr.isDefaultBilling,
    };
  });

  updated.unshift(newAddress);
  saveAddresses(updated);
  return newAddress;
}

export function updateAddress(
  id: string,
  data: Partial<Omit<UserAddress, "id">>
): UserAddress | null {
  const current = getSavedAddresses();
  const index = current.findIndex((a) => a.id === id);
  if (index === -1) return null;

  const updatedAddress: UserAddress = {
    ...current[index],
    ...data,
  };

  const updated = current.map((addr) => {
    if (addr.id === id) return updatedAddress;
    return {
      ...addr,
      isDefaultShipping: updatedAddress.isDefaultShipping
        ? false
        : addr.isDefaultShipping,
      isDefaultBilling: updatedAddress.isDefaultBilling
        ? false
        : addr.isDefaultBilling,
    };
  });

  saveAddresses(updated);
  return updatedAddress;
}

export function deleteAddress(id: string): void {
  const current = getSavedAddresses();
  const filtered = current.filter((a) => a.id !== id);
  if (filtered.length > 0) {
    if (!filtered.some((a) => a.isDefaultShipping)) {
      filtered[0].isDefaultShipping = true;
    }
    if (!filtered.some((a) => a.isDefaultBilling)) {
      filtered[0].isDefaultBilling = true;
    }
  }
  saveAddresses(filtered);
}

export function setDefaultShippingAddress(id: string): void {
  const current = getSavedAddresses();
  const updated = current.map((a) => ({
    ...a,
    isDefaultShipping: a.id === id,
  }));
  saveAddresses(updated);
}

export function setDefaultBillingAddress(id: string): void {
  const current = getSavedAddresses();
  const updated = current.map((a) => ({
    ...a,
    isDefaultBilling: a.id === id,
  }));
  saveAddresses(updated);
}
