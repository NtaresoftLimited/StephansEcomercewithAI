"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ShoppingBag,
  Scissors,
  Heart,
  MapPin,
  Smartphone,
  ShieldCheck,
  FileText,
  Download,
  Calendar,
  Clock,
  RotateCcw,
  Trash2,
  Plus,
  Check,
  LogOut,
  ChevronRight,
  Package,
  Edit3,
} from "lucide-react";
import {
  UserAddress,
  getSavedAddresses,
  deleteAddress,
  setDefaultShippingAddress,
  setDefaultBillingAddress,
} from "@/lib/address-book";
import { AddressModal } from "@/components/checkout/AddressModal";
import { toast } from "sonner";
import { formatPrice, formatDate, formatOrderNumber } from "@/lib/utils";
import { SIZE_LABELS, PRICES } from "@/lib/constants/grooming";
import {
  useTotalItems,
  useCartActions,
} from "@/lib/store/cart-store-provider";
import {
  useWishlistItems,
  useWishlistActions,
} from "@/lib/store/wishlist-store-provider";
import { ReorderButton, type ReorderableItem } from "./ReorderButton";

export interface PortalOnlineOrderItem {
  _key: string;
  quantity?: number | null;
  priceAtPurchase?: number | null;
  productName?: string | null;
  productRef?: string | null;
  resolvedName?: string | null;
  resolvedImage?: string | null;
}

export interface PortalOnlineOrder {
  _id: string;
  orderNumber?: string | null;
  total?: number | null;
  status?: string | null;
  createdAt?: string | null;
  customerName?: string | null;
  phone?: string | null;
  address?: {
    name?: string | null;
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    postcode?: string | null;
    country?: string | null;
  } | null;
  orderDataJson?: string | null;
  items?: PortalOnlineOrderItem[] | null;
  itemCount?: number | null;
  itemNames?: (string | null)[] | null;
  itemImages?: (string | null)[] | null;
}

export interface PortalPosOrder {
  id: number;
  name: string;
  posReference: string;
  dateOrder: string;
  amountTotal: number;
  state: string;
  branchName: string;
  items: Array<{
    id: number;
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
}

export interface PortalGroomingAppointment {
  id: string;
  bookingNumber: string;
  petName: string;
  petType: string;
  breedSize: string;
  package: string;
  price: number;
  appointmentDate: string;
  preferredTime?: string;
  detangling: boolean;
  status: string;
  notes?: string;
  source: "sanity" | "odoo";
}

export interface SavedDeliveryAddress {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  region: string;
  deliveryMethod: "home_delivery" | "pickup_masaki" | "pickup_mikocheni";
}

export const SAVED_ADDRESS_STORAGE_KEY = "sps-default-address";

interface CustomerPortalClientProps {
  user: {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    odooPartnerId?: number;
    isGuest: boolean;
  };
  onlineOrders: PortalOnlineOrder[];
  posOrders: PortalPosOrder[];
  groomingAppointments: PortalGroomingAppointment[];
}

type PortalSection =
  | "dashboard"
  | "orders"
  | "grooming"
  | "wishlist"
  | "addresses";

type OrderFilterTab = "all" | "online" | "pos" | "pending" | "completed";
type GroomingFilterTab =
  | "all"
  | "upcoming"
  | "pending"
  | "confirmed"
  | "completed";

function extractReorderItemsFromOnlineOrder(
  order: PortalOnlineOrder
): ReorderableItem[] {
  const result: ReorderableItem[] = [];

  if (order.orderDataJson) {
    try {
      const parsed = JSON.parse(order.orderDataJson);
      if (Array.isArray(parsed?.items) && parsed.items.length > 0) {
        for (const item of parsed.items) {
          const productId = item.productId || item._id || "";
          const name = item.name || item.productName || "Pet Store Item";
          const price = Number(item.price ?? item.priceAtPurchase ?? 0);
          const quantity = Math.max(1, Number(item.quantity) || 1);
          const image =
            item.image ||
            (productId.startsWith("odoo-")
              ? `https://erp.stephanspetstore.co.tz/web/image/product.template/${productId.replace("odoo-", "")}/image_1920`
              : undefined);
          result.push({ productId, name, price, quantity, image });
        }
        if (result.length > 0) return result;
      }
    } catch {
      // Fallback to Sanity items array
    }
  }

  if (Array.isArray(order.items)) {
    for (const item of order.items) {
      const productId = item.productRef || "";
      const name = item.resolvedName || item.productName || "Pet Store Item";
      const price = Number(item.priceAtPurchase ?? 0);
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const image =
        item.resolvedImage ||
        (productId.startsWith("odoo-")
          ? `https://erp.stephanspetstore.co.tz/web/image/product.template/${productId.replace("odoo-", "")}/image_1920`
          : undefined);
      result.push({ productId, name, price, quantity, image });
    }
  }

  return result;
}

function getPackageDisplayName(pkg: string): string {
  if (pkg === "super_premium") return "Super Premium Package";
  if (pkg === "premium") return "Premium Package";
  if (pkg === "standard") return "Standard Package";
  return pkg || "Full Grooming";
}

function resolveGroomingPrice(appt: PortalGroomingAppointment): number {
  if (appt.price && appt.price > 0) return appt.price;
  const petKey = appt.petType === "cat" ? "cat" : "dog";
  const base =
    PRICES[petKey]?.[appt.package]?.[appt.breedSize] ||
    PRICES[petKey]?.["standard"]?.["medium"] ||
    60000;
  return base + (appt.detangling ? 100000 : 0);
}

export function CustomerPortalClient({
  user,
  onlineOrders,
  posOrders,
  groomingAppointments,
}: CustomerPortalClientProps) {
  const [activeSection, setActiveSection] =
    useState<PortalSection>("dashboard");
  const [orderTab, setOrderTab] = useState<OrderFilterTab>("all");
  const [groomingTab, setGroomingTab] = useState<GroomingFilterTab>("all");

  const totalCartItems = useTotalItems();
  const { addItem: addToCart, openCart } = useCartActions();
  const wishlistItems = useWishlistItems();
  const { removeItem: removeFromWishlist } = useWishlistActions();

  const nameParts = (user.name || "").split(/\s+/);
  const latestOrderWithAddress = onlineOrders.find(
    (o) => o.address?.line1 || o.address?.city
  );

  const [addressList, setAddressList] = useState<UserAddress[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<UserAddress | null>(null);

  useEffect(() => {
    setAddressList(getSavedAddresses());
    const handleSync = () => setAddressList(getSavedAddresses());
    window.addEventListener("sps-address-book-updated", handleSync);
    return () => window.removeEventListener("sps-address-book-updated", handleSync);
  }, []);

  const [savedAddress, setSavedAddress] = useState<SavedDeliveryAddress>({
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" ") || "",
    phone: user.phone || latestOrderWithAddress?.phone || "",
    email: user.email || "",
    address: latestOrderWithAddress?.address?.line1 || "",
    city: latestOrderWithAddress?.address?.city || "Dar es Salaam",
    region: latestOrderWithAddress?.address?.postcode || "",
    deliveryMethod: "home_delivery",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_ADDRESS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSavedAddress((prev) => ({
          ...prev,
          ...parsed,
          phone: parsed.phone || prev.phone,
          email: parsed.email || prev.email,
        }));
      }
    } catch {
      // Ignore storage read errors
    }
  }, []);

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(
        SAVED_ADDRESS_STORAGE_KEY,
        JSON.stringify(savedAddress)
      );
      toast.success("Default delivery address & branch preference saved!");
    } catch {
      toast.error("Could not save address locally.");
    }
  };

  const metrics = useMemo(() => {
    const onlineTotal = onlineOrders.reduce(
      (sum, o) => sum + (Number(o.total) || 0),
      0
    );
    const posTotal = posOrders.reduce(
      (sum, o) => sum + (Number(o.amountTotal) || 0),
      0
    );
    const groomingTotal = groomingAppointments
      .filter((g) => g.status !== "cancelled")
      .reduce((sum, g) => sum + resolveGroomingPrice(g), 0);

    return {
      onlineTotal,
      posTotal,
      groomingTotal,
      grandTotal: onlineTotal + posTotal + groomingTotal,
      totalOrdersCount: onlineOrders.length + posOrders.length,
      totalGroomingCount: groomingAppointments.length,
    };
  }, [onlineOrders, posOrders, groomingAppointments]);

  const filteredOnlineOrders = useMemo(() => {
    if (orderTab === "pos") return [];
    if (orderTab === "pending") {
      return onlineOrders.filter(
        (o) =>
          !o.status ||
          ["pending", "processing", "confirmed"].includes(
            o.status.toLowerCase()
          )
      );
    }
    if (orderTab === "completed") {
      return onlineOrders.filter((o) =>
        ["paid", "delivered", "completed", "shipped"].includes(
          (o.status || "").toLowerCase()
        )
      );
    }
    return onlineOrders;
  }, [onlineOrders, orderTab]);

  const filteredPosOrders = useMemo(() => {
    if (orderTab === "online" || orderTab === "pending") return [];
    return posOrders;
  }, [posOrders, orderTab]);

  const filteredGrooming = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return groomingAppointments.filter((g) => {
      const state = (g.status || "pending").toLowerCase();
      if (groomingTab === "upcoming") {
        const d = new Date(g.appointmentDate);
        return d >= now && state !== "cancelled";
      }
      if (groomingTab === "pending") {
        return state === "pending" || state === "draft";
      }
      if (groomingTab === "confirmed") {
        return state === "confirmed" || state === "in_progress";
      }
      if (groomingTab === "completed") {
        return state === "done" || state === "completed";
      }
      return true;
    });
  }, [groomingAppointments, groomingTab]);

  const initials = (user.name || "SP")
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const navItems: Array<{
    id: PortalSection;
    label: string;
    shortLabel: string;
    icon: typeof LayoutDashboard;
    count?: number;
  }> = [
    {
      id: "dashboard",
      label: "Dashboard",
      shortLabel: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "orders",
      label: "Purchase History & POS",
      shortLabel: "Orders",
      icon: ShoppingBag,
      count: metrics.totalOrdersCount,
    },
    {
      id: "grooming",
      label: "Grooming & Appointments",
      shortLabel: "Grooming",
      icon: Scissors,
      count: metrics.totalGroomingCount,
    },
    {
      id: "wishlist",
      label: "My Wish List",
      shortLabel: "Wishlist",
      icon: Heart,
      count: wishlistItems.length,
    },
    {
      id: "addresses",
      label: "Delivery Address & Branch",
      shortLabel: "Address",
      icon: MapPin,
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-zinc-950 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Abandoned Cart Reminder Banner */}
        {totalCartItems > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 px-4 py-3 text-xs sm:text-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3e220f] text-white font-bold text-xs">
                {totalCartItems}
              </span>
              <p className="text-zinc-800 dark:text-zinc-200 font-medium">
                You have{" "}
                <strong>
                  {totalCartItems} item{totalCartItems > 1 ? "s" : ""}
                </strong>{" "}
                in your shopping cart. Order now before stock runs out.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openCart()}
                className="rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                View Cart
              </button>
              <Link
                href="/checkout"
                className="rounded-xl bg-[#3e220f] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#2a170a] transition-colors"
              >
                Checkout →
              </Link>
            </div>
          </div>
        )}

        {/* Mobile Compact Profile + Horizontal Navigation Bar */}
        <div className="lg:hidden mb-6 space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#3e220f] text-sm font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {user.name}
                </h1>
                <p className="truncate font-mono text-xs text-zinc-500">
                  {user.phone || user.email || "Verified Customer"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="shrink-0 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900"
            >
              Sign Out
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? "border-[#3e220f] bg-[#3e220f] text-white"
                      : "border-zinc-200/80 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.shortLabel}</span>
                  {item.count !== undefined && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT DESKTOP SIDEBAR: Minimalist Flat Box */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              <div className="border-b border-zinc-200/80 p-5 text-center dark:border-zinc-800">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#3e220f] text-lg font-bold text-white">
                  {initials}
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 mb-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {user.isGuest ? "Guest Session" : "Verified Account"}
                </div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {user.name}
                </h2>
                {user.phone && (
                  <p className="mt-1 flex items-center justify-center gap-1 font-mono text-xs text-zinc-500">
                    <Smartphone className="h-3.5 w-3.5" />
                    {user.phone}
                  </p>
                )}
                {user.email && (
                  <p className="mt-0.5 truncate text-xs text-zinc-400">
                    {user.email}
                  </p>
                )}
                {user.odooPartnerId && (
                  <div className="mt-2 inline-block rounded-lg border border-zinc-200/80 bg-zinc-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                    Odoo Partner #{user.odooPartnerId}
                  </div>
                )}
              </div>

              <nav className="p-2.5 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveSection(item.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                        isActive
                          ? "bg-[#3e220f] text-white"
                          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </span>
                      {item.count !== undefined ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {item.count}
                        </span>
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="border-t border-zinc-200/80 p-3 space-y-2 dark:border-zinc-800">
                <Link
                  href="/grooming#booking"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3e220f] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#2a170a] transition-colors"
                >
                  <Scissors className="h-3.5 w-3.5" />
                  Book Pet Grooming
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200/80 bg-white px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-pointer dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* RIGHT MAIN WORKSPACE */}
          <main className="lg:col-span-9 space-y-6">
            {/* ========================================================== */}
            {/* 1. DASHBOARD SECTION                                       */}
            {/* ========================================================== */}
            {activeSection === "dashboard" && (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                  {/* Minimalist Expenditure Summary Box */}
                  <div className="md:col-span-7 flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                          Total Store & Grooming Spend
                        </span>
                        <ShieldCheck className="h-4 w-4 text-zinc-400" />
                      </div>
                      <h3 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                        {formatPrice(metrics.grandTotal)}
                      </h3>
                      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-zinc-100 pt-4 text-xs dark:border-zinc-800">
                        <div>
                          <p className="text-zinc-400">Online Shop</p>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                            {formatPrice(metrics.onlineTotal)}
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-400">In-Store POS</p>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                            {formatPrice(metrics.posTotal)}
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-400">Pet Grooming</p>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                            {formatPrice(metrics.groomingTotal)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setActiveSection("orders")}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#3e220f] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#2a170a] transition-colors cursor-pointer"
                      >
                        Purchase History ({metrics.totalOrdersCount})
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSection("grooming")}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-zinc-100 px-4 py-2.5 text-xs font-semibold text-zinc-900 hover:bg-zinc-200/80 transition-colors cursor-pointer dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                      >
                        <Scissors className="h-3.5 w-3.5" />
                        Grooming ({metrics.totalGroomingCount})
                      </button>
                    </div>
                  </div>

                  {/* 3 Counter Summary Rows */}
                  <div className="md:col-span-5 flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 divide-y divide-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:divide-zinc-800">
                    <div className="flex items-center justify-between pb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-none">
                            {String(totalCartItems).padStart(2, "0")}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            Products in Cart
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/cart"
                        className="text-xs font-semibold text-zinc-900 hover:underline dark:text-zinc-100"
                      >
                        Open →
                      </Link>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                          <Heart className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-none">
                            {String(wishlistItems.length).padStart(2, "0")}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            Products in Wish List
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveSection("wishlist")}
                        className="text-xs font-semibold text-zinc-900 hover:underline dark:text-zinc-100 cursor-pointer"
                      >
                        View →
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                          <Package className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-none">
                            {String(
                              metrics.totalOrdersCount +
                                metrics.totalGroomingCount
                            ).padStart(2, "0")}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            Orders & Grooming Sessions
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveSection("orders")}
                        className="text-xs font-semibold text-zinc-900 hover:underline dark:text-zinc-100 cursor-pointer"
                      >
                        History →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Middle Row: Default Delivery Address + Latest Grooming Appointment */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Default Delivery Address Card */}
                  <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-zinc-500" />
                          Default Delivery & Branch
                        </h3>
                        <span className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                          {savedAddress.deliveryMethod === "pickup_masaki"
                            ? "Pickup: Masaki"
                            : savedAddress.deliveryMethod === "pickup_mikocheni"
                            ? "Pickup: Mikocheni"
                            : "Home Delivery"}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-200">
                          {savedAddress.firstName} {savedAddress.lastName}
                        </p>
                        {savedAddress.address ? (
                          <p>{savedAddress.address}</p>
                        ) : (
                          <p className="text-zinc-400">
                            No street address saved yet — add one for 1-click checkout.
                          </p>
                        )}
                        <p>
                          {[savedAddress.city, savedAddress.region, "Tanzania"]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        {savedAddress.phone && (
                          <p className="font-mono text-zinc-700 dark:text-zinc-300 pt-0.5">
                            {savedAddress.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveSection("addresses")}
                      className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200/80 bg-zinc-100 px-4 text-xs font-semibold text-zinc-900 hover:bg-zinc-200/80 transition-colors cursor-pointer dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {savedAddress.address
                        ? "Edit Delivery Address"
                        : "Add Default Address"}
                    </button>
                  </div>

                  {/* Pet Grooming & Spa Card */}
                  <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          <Scissors className="h-4 w-4 text-zinc-500" />
                          Pet Grooming Appointments
                        </h3>
                        <Link
                          href="/grooming#booking"
                          className="text-xs font-semibold text-zinc-900 hover:underline dark:text-zinc-100"
                        >
                          + Book Session
                        </Link>
                      </div>

                      {groomingAppointments.length > 0 ? (
                        (() => {
                          const latest = groomingAppointments[0];
                          return (
                            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-900">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                  #{latest.bookingNumber}
                                </span>
                                <span className="rounded-md bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold uppercase text-white dark:bg-zinc-100 dark:text-zinc-900">
                                  {latest.status}
                                </span>
                              </div>
                              <p className="mt-1.5 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                {latest.petName}{" "}
                                <span className="text-xs font-normal text-zinc-500">
                                  ({latest.petType === "cat" ? "Cat" : "Dog"} •{" "}
                                  {getPackageDisplayName(latest.package)})
                                </span>
                              </p>
                              <p className="mt-1 text-xs text-zinc-500 flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(latest.appointmentDate)}
                                {latest.preferredTime
                                  ? ` at ${latest.preferredTime}`
                                  : ""}
                              </p>
                            </div>
                          );
                        })()
                      ) : (
                        <p className="text-xs text-zinc-500 leading-relaxed">
                          Schedule Standard, Premium, or Super Premium dog & cat grooming sessions at our Masaki and Mikocheni salons.
                        </p>
                      )}
                    </div>

                    <div className="mt-5 flex items-center gap-2.5">
                      {groomingAppointments.length > 0 ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setActiveSection("grooming")}
                            className="flex-1 h-10 rounded-xl border border-zinc-200/80 bg-zinc-100 text-xs font-semibold text-zinc-900 hover:bg-zinc-200/80 transition-colors cursor-pointer dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                          >
                            All Sessions ({groomingAppointments.length})
                          </button>
                          <Link
                            href={`/grooming?petType=${encodeURIComponent(
                              groomingAppointments[0].petType
                            )}&package=${encodeURIComponent(
                              groomingAppointments[0].package
                            )}&size=${encodeURIComponent(
                              groomingAppointments[0].breedSize
                            )}&petName=${encodeURIComponent(
                              groomingAppointments[0].petName
                            )}&detangling=${
                              groomingAppointments[0].detangling ? "1" : "0"
                            }#booking`}
                            className="flex-1 h-10 flex items-center justify-center rounded-xl bg-[#3e220f] text-xs font-semibold text-white hover:bg-[#2a170a] transition-colors"
                          >
                            Rebook {groomingAppointments[0].petName}
                          </Link>
                        </>
                      ) : (
                        <Link
                          href="/grooming#booking"
                          className="h-10 w-full flex items-center justify-center rounded-xl bg-[#3e220f] text-xs font-semibold text-white hover:bg-[#2a170a] transition-colors"
                        >
                          Book Grooming Session
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Orders & In-Store POS Preview */}
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                      Recent Orders & In-Store Receipts
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveSection("orders")}
                      className="text-xs font-semibold text-zinc-900 hover:underline dark:text-zinc-100 cursor-pointer"
                    >
                      View All ({metrics.totalOrdersCount}) →
                    </button>
                  </div>

                  {onlineOrders.length === 0 && posOrders.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-xs sm:text-sm text-zinc-500">
                        No orders yet. Your online orders and Masaki/Mikocheni POS purchases will appear here automatically.
                      </p>
                      <Link
                        href="/shop"
                        className="mt-3 inline-flex h-10 items-center justify-center rounded-xl bg-[#3e220f] px-5 text-xs font-semibold text-white hover:bg-[#2a170a]"
                      >
                        Browse Shop
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {onlineOrders.slice(0, 3).map((order) => {
                        const reorderItems =
                          extractReorderItemsFromOnlineOrder(order);
                        return (
                          <div
                            key={order._id}
                            className="flex flex-wrap items-center justify-between gap-3 py-3.5"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <Link
                                  href={`/orders/${order._id}`}
                                  className="font-mono text-xs font-bold text-zinc-900 hover:underline dark:text-zinc-100"
                                >
                                  #{formatOrderNumber(order.orderNumber)}
                                </Link>
                                <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                                  Online
                                </span>
                                <span className="text-xs text-zinc-400">
                                  {formatDate(order.createdAt)}
                                </span>
                              </div>
                              <p className="mt-1 truncate text-xs text-zinc-500">
                                {reorderItems
                                  .map((i) => `${i.name} ×${i.quantity}`)
                                  .join(", ") || "Pet Store Order"}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                {formatPrice(order.total)}
                              </span>
                              <ReorderButton
                                items={reorderItems}
                                orderLabel={`Order #${formatOrderNumber(order.orderNumber)}`}
                              />
                            </div>
                          </div>
                        );
                      })}

                      {posOrders.slice(0, 2).map((pos) => (
                        <div
                          key={pos.id}
                          className="flex flex-wrap items-center justify-between gap-3 py-3.5"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                {pos.posReference}
                              </span>
                              <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                                {pos.branchName}
                              </span>
                              <span className="text-xs text-zinc-400">
                                {formatDate(pos.dateOrder)}
                              </span>
                            </div>
                            {pos.items.length > 0 && (
                              <p className="mt-1 truncate text-xs text-zinc-500">
                                {pos.items
                                  .map((i) => `${i.name} ×${i.quantity}`)
                                  .join(", ")}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                              {formatPrice(pos.amountTotal)}
                            </span>
                            {pos.items.length > 0 && (
                              <ReorderButton
                                items={pos.items}
                                orderLabel={pos.posReference}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ========================================================== */}
            {/* 2. PURCHASE HISTORY & POS ORDERS SECTION                   */}
            {/* ========================================================== */}
            {activeSection === "orders" && (
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      Purchase History & POS Receipts
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Reorder any online or Masaki/Mikocheni in-store purchase in one click
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        { id: "all", label: "All" },
                        {
                          id: "online",
                          label: `Online (${onlineOrders.length})`,
                        },
                        {
                          id: "pos",
                          label: `In-Store POS (${posOrders.length})`,
                        },
                        { id: "pending", label: "Pending" },
                        { id: "completed", label: "Paid / Completed" },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setOrderTab(t.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                          orderTab === t.id
                            ? "bg-[#3e220f] text-white"
                            : "border border-zinc-200/80 bg-white text-zinc-600 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {filteredOnlineOrders.length === 0 &&
                    filteredPosOrders.length === 0 && (
                      <div className="py-12 text-center">
                        <Package className="mx-auto h-9 w-9 text-zinc-300 mb-2" />
                        <p className="text-xs sm:text-sm font-medium text-zinc-500">
                          No orders match this filter.
                        </p>
                      </div>
                    )}

                  {filteredOnlineOrders.map((order) => {
                    const reorderItems =
                      extractReorderItemsFromOnlineOrder(order);
                    const orderCode = formatOrderNumber(order.orderNumber);
                    const isPaid = ["paid", "delivered", "completed"].includes(
                      (order.status || "").toLowerCase()
                    );

                    return (
                      <div
                        key={order._id}
                        className="rounded-xl border border-zinc-200/80 p-4 sm:p-5 dark:border-zinc-800"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3.5 dark:border-zinc-800">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                href={`/orders/${order._id}`}
                                className="text-sm sm:text-base font-bold text-zinc-900 hover:underline dark:text-zinc-100"
                              >
                                Order #{orderCode}
                              </Link>
                              <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-semibold capitalize text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                                {order.status || "Pending"}
                              </span>
                              <span
                                className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                  isPaid
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-zinc-100 text-zinc-600"
                                }`}
                              >
                                {isPaid ? "Paid" : "Online Order"}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-zinc-500">
                              Date: {formatDate(order.createdAt)}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <ReorderButton
                              items={reorderItems}
                              orderLabel={`Order #${orderCode}`}
                            />
                            <Link
                              href={`/orders/${order._id}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Details
                            </Link>
                            {order.orderNumber && (
                              <a
                                href={`/receipt/${order.orderNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                              >
                                <Download className="h-3.5 w-3.5" />
                                Invoice
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
                          {reorderItems.map((item, idx) => (
                            <div
                              key={`${order._id}-item-${idx}`}
                              className="flex items-center justify-between gap-4 py-2.5"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-zinc-200/80 bg-white">
                                  {item.image ? (
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      fill
                                      className="object-contain p-1"
                                      sizes="44px"
                                    />
                                  ) : (
                                    <div className="flex h-full items-center justify-center text-[10px] text-zinc-400">
                                      SPS
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-zinc-500">
                                    Qty: {item.quantity} ×{" "}
                                    {formatPrice(item.price)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right font-mono text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                {formatPrice(item.price * item.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                          <span className="text-xs text-zinc-500">
                            {order.address?.city
                              ? `Delivery: ${order.address.line1 ? `${order.address.line1}, ` : ""}${order.address.city}`
                              : "Stephan's Pet Store"}
                          </span>
                          <span className="font-mono text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                            Total: {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {filteredPosOrders.map((pos) => (
                    <div
                      key={pos.id}
                      className="rounded-xl border border-zinc-200/80 p-4 sm:p-5 dark:border-zinc-800"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3.5 dark:border-zinc-800">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                              POS Receipt - {pos.posReference}
                            </span>
                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              Paid In-Store
                            </span>
                            <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                              {pos.branchName}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-zinc-500">
                            Synced from Odoo ERP • Date:{" "}
                            {formatDate(pos.dateOrder)}
                          </p>
                        </div>

                        {pos.items.length > 0 && (
                          <ReorderButton
                            items={pos.items}
                            orderLabel={pos.posReference}
                          />
                        )}
                      </div>

                      {pos.items.length > 0 && (
                        <div className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
                          {pos.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-4 py-2.5"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-zinc-200/80 bg-white">
                                  {item.image ? (
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      fill
                                      className="object-contain p-1"
                                      sizes="44px"
                                    />
                                  ) : null}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-zinc-500">
                                    Qty: {item.quantity} ×{" "}
                                    {formatPrice(item.price)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right font-mono text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                {formatPrice(item.price * item.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                        <span className="text-xs text-zinc-500">
                          Branch: {pos.branchName}
                        </span>
                        <span className="font-mono text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                          Total: {formatPrice(pos.amountTotal)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* 3. PET GROOMING ORDERS & APPOINTMENTS SECTION              */}
            {/* ========================================================== */}
            {activeSection === "grooming" && (
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      Pet Grooming Orders & Appointments
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Track upcoming grooming sessions, view past spa packages, or rebook your pet in one click
                    </p>
                  </div>

                  <Link
                    href="/grooming#booking"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3e220f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2a170a] transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Book New Appointment
                  </Link>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(
                    [
                      {
                        id: "all",
                        label: `All (${groomingAppointments.length})`,
                      },
                      { id: "upcoming", label: "Upcoming" },
                      { id: "pending", label: "Pending" },
                      { id: "confirmed", label: "Confirmed" },
                      { id: "completed", label: "Completed" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setGroomingTab(t.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                        groomingTab === t.id
                          ? "bg-[#3e220f] text-white"
                          : "border border-zinc-200/80 bg-white text-zinc-600 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="mt-5 space-y-4">
                  {filteredGrooming.length === 0 ? (
                    <div className="py-12 text-center">
                      <Scissors className="mx-auto h-9 w-9 text-zinc-300 mb-2" />
                      <p className="text-xs sm:text-sm font-medium text-zinc-500">
                        No grooming appointments found in this tab.
                      </p>
                      <Link
                        href="/grooming#booking"
                        className="mt-3 inline-flex h-10 items-center justify-center rounded-xl bg-[#3e220f] px-5 text-xs font-semibold text-white"
                      >
                        Book Grooming Session
                      </Link>
                    </div>
                  ) : (
                    filteredGrooming.map((appt) => {
                      const price = resolveGroomingPrice(appt);
                      const pkgLabel = getPackageDisplayName(appt.package);
                      const sizeLabel =
                        SIZE_LABELS[appt.breedSize] || appt.breedSize;
                      const rebookHref = `/grooming?petType=${encodeURIComponent(
                        appt.petType
                      )}&package=${encodeURIComponent(
                        appt.package
                      )}&size=${encodeURIComponent(
                        appt.breedSize
                      )}&petName=${encodeURIComponent(
                        appt.petName
                      )}&detangling=${appt.detangling ? "1" : "0"}#booking`;

                      const whatsappFollowUpText = encodeURIComponent(
                        `Hi Stephan's Pet Store! I am checking on my grooming appointment #${appt.bookingNumber} for ${appt.petName} (${pkgLabel}) scheduled on ${formatDate(appt.appointmentDate)}.`
                      );

                      return (
                        <div
                          key={appt.id}
                          className="rounded-xl border border-zinc-200/80 p-4 sm:p-5 dark:border-zinc-800"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3.5 dark:border-zinc-800">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50">
                                <Image
                                  src={
                                    appt.petType === "cat"
                                      ? "/icons/icon-cat.png"
                                      : "/icons/icon-dog.png"
                                  }
                                  alt={appt.petType}
                                  width={22}
                                  height={22}
                                  className="object-contain"
                                />
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                    #{appt.bookingNumber}
                                  </span>
                                  <span className="rounded-md bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold uppercase text-white dark:bg-zinc-100 dark:text-zinc-900">
                                    {appt.status}
                                  </span>
                                  <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                                    {appt.source === "odoo"
                                      ? "Odoo ERP"
                                      : "Online Booking"}
                                  </span>
                                </div>
                                <p className="mt-0.5 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                  Pet: {appt.petName}{" "}
                                  <span className="font-normal text-xs text-zinc-500">
                                    ({sizeLabel})
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                href={rebookHref}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#3e220f] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#2a170a] transition-colors"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Rebook {appt.petName}
                              </Link>
                              <a
                                href={`https://wa.me/255769324445?text=${whatsappFollowUpText}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                              >
                                <Image
                                  src="/whatsapp-official.png"
                                  alt="WhatsApp"
                                  width={15}
                                  height={15}
                                  className="object-contain"
                                />
                                WhatsApp Salon
                              </a>
                            </div>
                          </div>

                          <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
                            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                              <span className="text-zinc-400 block">
                                Selected Package
                              </span>
                              <span className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 block">
                                {pkgLabel}
                              </span>
                              {appt.detangling && (
                                <span className="mt-1 inline-block rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700">
                                  + Detangling Service
                                </span>
                              )}
                            </div>

                            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                              <span className="text-zinc-400 block">
                                Appointment Schedule
                              </span>
                              <span className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                                {formatDate(appt.appointmentDate)}
                              </span>
                              {appt.preferredTime && (
                                <span className="text-zinc-500 mt-0.5 flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5 text-zinc-400" />
                                  {appt.preferredTime}
                                </span>
                              )}
                            </div>

                            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/50 flex flex-col justify-between">
                              <span className="text-zinc-400 block">
                                Package Total
                              </span>
                              <span className="font-mono text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                                {formatPrice(price)}
                              </span>
                            </div>
                          </div>

                          {appt.notes && (
                            <p className="mt-2.5 text-xs text-zinc-500">
                              Notes: {appt.notes}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* 4. WISH LIST SECTION                                       */}
            {/* ========================================================== */}
            {activeSection === "wishlist" && (
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      My Saved Wish List ({wishlistItems.length})
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Add your saved pet items straight to your shopping cart
                    </p>
                  </div>
                  <Link
                    href="/shop"
                    className="rounded-xl bg-[#3e220f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2a170a]"
                  >
                    Browse Shop
                  </Link>
                </div>

                {wishlistItems.length === 0 ? (
                  <div className="py-12 text-center">
                    <Heart className="mx-auto h-9 w-9 text-zinc-300 mb-2" />
                    <p className="text-xs sm:text-sm font-medium text-zinc-500">
                      Your wish list is currently empty.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {wishlistItems.map((item) => (
                      <div
                        key={item.productId}
                        className="flex flex-col justify-between rounded-xl border border-zinc-200/80 p-3.5 transition-colors hover:border-zinc-400 dark:border-zinc-800"
                      >
                        <div>
                          <div className="relative mb-3 h-36 w-full overflow-hidden rounded-lg bg-zinc-50">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-contain p-2"
                                sizes="200px"
                              />
                            ) : null}
                            <button
                              type="button"
                              onClick={() => {
                                removeFromWishlist(item.productId);
                                toast.info("Removed from wish list");
                              }}
                              title="Remove from wish list"
                              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:text-red-600 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <Link
                            href={`/shop/${item.slug || item.productId}`}
                            className="line-clamp-2 text-xs sm:text-sm font-semibold text-zinc-900 hover:underline dark:text-zinc-100"
                          >
                            {item.name}
                          </Link>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                          <span className="font-mono text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {formatPrice(item.price)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              addToCart(
                                {
                                  productId: item.productId,
                                  name: item.name,
                                  price: item.price,
                                  image: item.image,
                                },
                                1
                              );
                              toast.success(`${item.name} added to cart!`);
                            }}
                            className="rounded-lg bg-[#3e220f] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2a170a] cursor-pointer"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================== */}
            {/* 5. SAVED DELIVERY ADDRESS & PREFERRED BRANCH SECTION       */}
            {/* ========================================================== */}
            {activeSection === "addresses" && (
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    Default Delivery Address & Branch Pickup Preference
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Saved locally and pre-filled automatically during checkout
                  </p>
                </div>

                <form onSubmit={handleSaveAddress} className="mt-5 space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                      Preferred Fulfillment Method
                    </label>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {[
                        {
                          id: "home_delivery",
                          title: "Home Delivery",
                          desc: "Dar es Salaam & Upcountry door delivery",
                        },
                        {
                          id: "pickup_masaki",
                          title: "Pickup — Masaki",
                          desc: "11 Slipway Rd, Masaki",
                        },
                        {
                          id: "pickup_mikocheni",
                          title: "Pickup — Mikocheni",
                          desc: "59 Mikocheni A, Dar es Salaam",
                        },
                      ].map((opt) => {
                        const isSelected =
                          savedAddress.deliveryMethod === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              setSavedAddress((prev) => ({
                                ...prev,
                                deliveryMethod:
                                  opt.id as SavedDeliveryAddress["deliveryMethod"],
                              }))
                            }
                            className={`rounded-xl border p-3.5 text-left transition-colors cursor-pointer ${
                              isSelected
                                ? "border-[#3e220f] bg-zinc-50 dark:bg-zinc-900"
                                : "border-zinc-200/80 hover:border-zinc-300 dark:border-zinc-800"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                {opt.title}
                              </span>
                              {isSelected && (
                                <Check className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
                              )}
                            </div>
                            <p className="mt-1 text-[11px] text-zinc-500">
                              {opt.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={savedAddress.firstName}
                        onChange={(e) =>
                          setSavedAddress({
                            ...savedAddress,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={savedAddress.lastName}
                        onChange={(e) =>
                          setSavedAddress({
                            ...savedAddress,
                            lastName: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Phone Number (WhatsApp) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={savedAddress.phone}
                        onChange={(e) =>
                          setSavedAddress({
                            ...savedAddress,
                            phone: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={savedAddress.email}
                        onChange={(e) =>
                          setSavedAddress({
                            ...savedAddress,
                            email: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Street Address / Landmark (Masaki, Mikocheni, Oysterbay, etc.)
                    </label>
                    <input
                      type="text"
                      value={savedAddress.address}
                      onChange={(e) =>
                        setSavedAddress({
                          ...savedAddress,
                          address: e.target.value,
                        })
                      }
                      placeholder="House/Apt number, street name, or nearby landmark"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={savedAddress.city}
                        onChange={(e) =>
                          setSavedAddress({
                            ...savedAddress,
                            city: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Area / Neighborhood
                      </label>
                      <input
                        type="text"
                        value={savedAddress.region}
                        onChange={(e) =>
                          setSavedAddress({
                            ...savedAddress,
                            region: e.target.value,
                          })
                        }
                        placeholder="e.g. Masaki, Mikocheni"
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="h-11 rounded-xl bg-[#3e220f] px-6 text-xs font-semibold text-white hover:bg-[#2a170a] transition-colors cursor-pointer"
                    >
                      Save Default Delivery Preferences
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
