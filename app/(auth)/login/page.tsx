"use client";

import { Suspense, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InternationalPhonePill } from "@/components/auth/InternationalPhonePill";
import {
  getCountryByIso,
  getFlagUrl,
  normalizeInternationalPhone,
} from "@/lib/phone";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  MessageCircle,
  UserCheck,
  ShieldCheck,
  RefreshCw,
  Heart,
  Receipt,
  Scissors,
  Zap,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";

type AuthMode = "odoo" | "whatsapp";
type OdooStep = "identifier" | "login_password" | "create_password";

const ACCOUNT_BENEFITS: Array<{
  icon?: any;
  imageSrc?: string;
  label: string;
}> = [
  {
    icon: Zap,
    label: "Check Out Faster",
  },
  {
    icon: Receipt,
    label: "View Orders",
  },
  {
    icon: Heart,
    label: "Wish Lists",
  },
  {
    imageSrc: "/about/grooming-scissors.png",
    label: "Grooming",
  },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/orders";

  const [mode, setMode] = useState<AuthMode>("whatsapp");
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  // Odoo Customer Auth State (Phone or Email -> Login Password OR Create a Password)
  const [odooStep, setOdooStep] = useState<OdooStep>("identifier");
  const [odooIdentifier, setOdooIdentifier] = useState("");
  const [odooCountryIso, setOdooCountryIso] = useState("tz");
  const [odooDisplayIdentifier, setOdooDisplayIdentifier] = useState("");
  const [odooNormalizedIdentifier, setOdooNormalizedIdentifier] = useState("");
  const [odooIsPhone, setOdooIsPhone] = useState(true);
  const [odooPassword, setOdooPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // WhatsApp OTP State
  const [waStep, setWaStep] = useState<"phone" | "otp">("phone");
  const [waPhone, setWaPhone] = useState("");
  const [waCountryIso, setWaCountryIso] = useState("tz");
  const [waOtp, setWaOtp] = useState("");
  const [waNormalizedPhone, setWaNormalizedPhone] = useState("");
  const [waDisplayPhone, setWaDisplayPhone] = useState("");

  const digitCount = odooPassword.replace(/\D/g, "").length;
  const isPasswordValidLength = digitCount >= 4;

  // Handle any auth error query parameter gracefully
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      if (errorParam === "CredentialsSignin") {
        toast.error("Invalid login credentials. Please try again.");
      } else if (errorParam !== "Configuration") {
        toast.info("Please sign in to access your account.");
      }
    }
  }, [searchParams]);

  // Step 1: Check Phone Number or Email in Odoo
  async function handleOdooIdentifierContinue(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    const raw = odooIdentifier.trim();
    if (!raw) {
      toast.error("Please enter your phone number or email address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/odoo/check-identifier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: raw,
          countryIso: odooCountryIso,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Could not verify phone number or email");
        setLoading(false);
        return;
      }

      setOdooNormalizedIdentifier(data.normalizedIdentifier || raw);
      setOdooDisplayIdentifier(data.displayIdentifier || raw);
      if (data.countryIso) {
        setOdooCountryIso(data.countryIso);
      }
      setOdooIsPhone(Boolean(data.isPhone));
      setOdooPassword("");

      if (data.userExists) {
        setOdooStep("login_password");
      } else {
        setOdooStep("create_password");
      }
    } catch {
      toast.error("Unable to connect to Odoo right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2A: Sign In with Existing Odoo Password
  async function handleOdooLoginSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!odooPassword) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: odooNormalizedIdentifier || odooIdentifier.trim(),
        password: odooPassword,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid password. Try again or use WhatsApp OTP.");
        setLoading(false);
      } else {
        toast.success("Welcome back to Stephan's Pet Store!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      toast.error("Unable to sign in right now. Please try again.");
      setLoading(false);
    }
  }

  // Step 2B: Create a Password Screen (Provisions Odoo Portal User + Signs In)
  async function handleOdooCreatePasswordSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    if (!isPasswordValidLength) {
      toast.error("Your password must contain 4 digits (can be your year of birth)");
      return;
    }

    setLoading(true);
    try {
      const targetIdentifier =
        odooNormalizedIdentifier || odooIdentifier.trim();
      const res = await fetch("/api/auth/odoo/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: targetIdentifier,
          password: odooPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not create password");
        setLoading(false);
        return;
      }

      // Immediately authenticate via NextAuth Odoo Credentials provider
      const signInResult = await signIn("credentials", {
        email: data.login || targetIdentifier,
        password: odooPassword,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.success("Password created! Please sign in.");
        setOdooStep("login_password");
        setLoading(false);
      } else {
        toast.success("Password created & signed in to Stephan's Pet Store!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      toast.error("Network error while creating password. Please try again.");
      setLoading(false);
    }
  }

  // Request WhatsApp 6-Digit OTP via Native Odoo whatsapp_connector
  async function handleSendWhatsAppOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const targetPhone = waPhone.trim();
    if (!targetPhone) {
      toast.error("Please enter your WhatsApp phone number");
      return;
    }

    const parsed = normalizeInternationalPhone(targetPhone, waCountryIso);

    setLoading(true);
    try {
      const res = await fetch("/api/auth/whatsapp/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: parsed.e164 || targetPhone,
          countryIso: parsed.country.iso2,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not send WhatsApp verification code");
        setLoading(false);
        return;
      }

      setWaNormalizedPhone(data.phone || parsed.e164 || targetPhone);
      setWaDisplayPhone(
        data.displayPhone || parsed.formattedInternational || targetPhone
      );
      if (data.countryIso) {
        setWaCountryIso(data.countryIso);
      }
      setWaStep("otp");
      toast.success(
        data.message || "6-digit verification code sent to your WhatsApp!"
      );
    } catch {
      toast.error("Network error while requesting WhatsApp code");
    } finally {
      setLoading(false);
    }
  }

  // Verify WhatsApp 6-Digit OTP via Native Odoo _check_credentials
  async function handleVerifyWhatsAppOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cleanedOtp = waOtp.replace(/\D/g, "");
    if (cleanedOtp.length !== 6) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("whatsapp-otp", {
        phone: waNormalizedPhone || waPhone,
        otp: cleanedOtp,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid or expired verification code. Please try again.");
        setLoading(false);
      } else {
        toast.success("WhatsApp verified! Welcome to Stephan's Pet Store.");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      toast.error("Verification failed. Please try again.");
      setLoading(false);
    }
  }

  // Protected Guest Session Login
  async function handleContinueAsGuest() {
    setGuestLoading(true);
    try {
      const result = await signIn("guest", {
        name: "Guest Shopper",
        redirect: false,
      });

      if (result?.error) {
        toast.error("Could not start guest session");
        setGuestLoading(false);
      } else {
        toast.success("Continuing as Guest");
        router.push(callbackUrl === "/orders" ? "/shop" : callbackUrl);
        router.refresh();
      }
    } catch {
      router.push(callbackUrl === "/orders" ? "/shop" : callbackUrl);
    }
  }

  const isPasswordScreen =
    mode === "odoo" &&
    (odooStep === "create_password" || odooStep === "login_password");

  const activeOdooCountry = getCountryByIso(odooCountryIso);
  const activeWaCountry = getCountryByIso(waCountryIso);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f5] px-4 py-10 sm:py-14 dark:bg-zinc-950">
      <div className="w-full max-w-[460px] space-y-6 rounded-2xl border border-zinc-200/80 bg-white p-7 sm:p-9 shadow-[0_10px_35px_rgb(0,0,0,0.05)] dark:border-zinc-800 dark:bg-zinc-900">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <Link
            href="/"
            className="mb-5 inline-flex items-center justify-center transition-opacity hover:opacity-85"
          >
            <Image
              src="/logo.png"
              alt="Stephan's Pet Store"
              width={180}
              height={50}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          {mode === "odoo" && odooStep === "create_password" ? (
            <>
              <h1 className="text-center text-2xl sm:text-[28px] font-bold tracking-tight text-[#3e220f] dark:text-zinc-100">
                Create a password
              </h1>
              <p className="mt-2 max-w-[330px] text-center text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                You&apos;ll use this password to log in to Stephan&apos;s Pet
                Store and your Odoo Customer Portal
              </p>
            </>
          ) : mode === "odoo" && odooStep === "login_password" ? (
            <>
              <h1 className="text-center text-2xl sm:text-[28px] font-bold tracking-tight text-[#3e220f] dark:text-zinc-100">
                Enter your password
              </h1>
              <p className="mt-2 max-w-[330px] text-center text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Sign in with your Stephan&apos;s Pet Store &amp; Odoo Customer
                Portal password
              </p>
            </>
          ) : (
            <>
              <h1 className="text-center text-2xl sm:text-[26px] font-bold tracking-tight text-[#3e220f] dark:text-zinc-100">
                Welcome Back!
              </h1>
              <p className="mt-2 text-center text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Log in to check out faster, keep your account
                <br className="hidden sm:inline" /> details up to date, view
                your orders, and manage
                <br className="hidden sm:inline" /> your wish lists.
              </p>
            </>
          )}
        </div>

        {/* Feature Highlights Plain List (No boxes, lines, or shadows - clean plain layout) */}
        {!isPasswordScreen && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-1 py-1 text-left">
            {ACCOUNT_BENEFITS.map((perk) => {
              const Icon = perk.icon;
              return (
                <div
                  key={perk.label}
                  className="flex items-center gap-2"
                >
                  {perk.imageSrc ? (
                    <Image
                      src={perk.imageSrc}
                      alt={perk.label}
                      width={16}
                      height={16}
                      className="h-4 w-4 object-contain shrink-0"
                    />
                  ) : Icon ? (
                    <Icon className="h-4 w-4 text-[#8b4f22] dark:text-amber-400 shrink-0" />
                  ) : null}
                  <span className="text-xs font-bold text-[#3e220f] dark:text-zinc-100 truncate">
                    {perk.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Auth Method Switcher (WhatsApp vs Email) */}
        <div
          role="tablist"
          aria-label="Sign in method"
          className="grid grid-cols-2 gap-1.5 rounded-xl bg-zinc-100/90 p-1.5 dark:bg-zinc-800/80"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "whatsapp"}
            onClick={() => {
              setMode("whatsapp");
              setLoading(false);
            }}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-xs font-bold uppercase tracking-wider transition-all ${
              mode === "whatsapp"
                ? "bg-white text-[#128C7E] shadow-xs dark:bg-zinc-900 dark:text-[#25D366]"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Image
              src="/whatsapp-official.png"
              alt="WhatsApp"
              width={16}
              height={16}
              className="h-4 w-4 object-contain shrink-0"
            />
            <span className="leading-none">WhatsApp</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "odoo"}
            onClick={() => {
              setMode("odoo");
              setLoading(false);
            }}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-xs font-bold uppercase tracking-wider transition-all ${
              mode === "odoo"
                ? "bg-white text-[#3e220f] shadow-xs dark:bg-zinc-900 dark:text-amber-400"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Image
              src="/email-official.png"
              alt="Email"
              width={16}
              height={16}
              className="h-4 w-4 object-contain shrink-0"
            />
            <span className="leading-none">Email</span>
          </button>
        </div>

        {/* MODE 1: ODOO CUSTOMER AUTH (Identifier -> Create a Password / Enter Password) */}
        {mode === "odoo" && (
          <div className="space-y-4">
            {odooStep === "identifier" && (
              <form
                onSubmit={handleOdooIdentifierContinue}
                className="space-y-4 text-left"
              >
                <InternationalPhonePill
                  id="odoo_identifier"
                  label="Phone number or email"
                  value={odooIdentifier}
                  countryIso={odooCountryIso}
                  allowEmail={true}
                  accentColor="coffee"
                  onChange={(raw, nextIso, e164, formattedDisplay) => {
                    setOdooIdentifier(raw);
                    setOdooCountryIso(nextIso);
                    setOdooNormalizedIdentifier(e164);
                    setOdooDisplayIdentifier(formattedDisplay);
                  }}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#3e220f] px-6 text-base font-semibold text-white transition-all hover:bg-[#573017] disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                      <span>Checking Odoo Account...</span>
                    </>
                  ) : (
                    <span>Continue</span>
                  )}
                </button>
              </form>
            )}

            {(odooStep === "create_password" ||
              odooStep === "login_password") && (
              <form
                onSubmit={
                  odooStep === "create_password"
                    ? handleOdooCreatePasswordSubmit
                    : handleOdooLoginSubmit
                }
                className="space-y-4 text-left"
              >
                {/* Floating-Label Read-Only Identifier Pill with Country Flag & "Edit" Action */}
                <div className="relative flex h-14 w-full items-center justify-between rounded-full border border-zinc-300 bg-transparent px-5 dark:border-zinc-700">
                  <span className="absolute -top-2.5 left-4 bg-white px-1.5 text-xs font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                    {odooIsPhone ? "Phone number" : "Email address"}
                  </span>
                  <div className="flex items-center gap-2.5 truncate">
                    {odooIsPhone && (
                      <img
                        src={getFlagUrl(activeOdooCountry.iso2)}
                        alt={activeOdooCountry.name}
                        width={22}
                        height={16}
                        className="h-4 w-5.5 shrink-0 rounded-[2px] object-cover shadow-2xs"
                      />
                    )}
                    <span className="truncate text-base font-medium text-zinc-900 dark:text-zinc-100">
                      {odooDisplayIdentifier || odooIdentifier}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOdooStep("identifier");
                      setOdooPassword("");
                    }}
                    className="ml-3 shrink-0 text-sm font-semibold text-[#6366f1] transition-colors hover:text-[#4f46e5] dark:text-indigo-400"
                  >
                    Edit
                  </button>
                </div>

                {/* Floating-Label Password Pill with Eye/EyeOff Toggle */}
                <div className="relative flex h-14 w-full items-center rounded-full border border-zinc-300 bg-transparent px-5 focus-within:border-[#3e220f] dark:border-zinc-700 dark:focus-within:border-amber-400">
                  <label
                    htmlFor="odoo_password"
                    className="absolute -top-2.5 left-4 bg-white px-1.5 text-xs font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
                  >
                    Password
                  </label>
                  <input
                    id="odoo_password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    inputMode="numeric"
                    required
                    autoFocus
                    value={odooPassword}
                    onChange={(e) => setOdooPassword(e.target.value)}
                    placeholder={
                      odooStep === "create_password"
                        ? "e.g. 1990 (4 digits)"
                        : "Enter 4-digit PIN or password"
                    }
                    autoComplete={
                      odooStep === "create_password"
                        ? "new-password"
                        : "current-password"
                    }
                    className="h-full w-full bg-transparent pr-3 text-left text-base text-zinc-900 outline-none dark:text-zinc-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="shrink-0 text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Password Requirement Box (Shown on "Create a password" screen) */}
                {odooStep === "create_password" && (
                  <div className="rounded-lg border border-zinc-300 bg-zinc-50/50 px-4 py-3.5 text-left dark:border-zinc-700 dark:bg-zinc-800/40">
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                      Your password must contain:
                    </p>
                    <div className="mt-2 flex items-center gap-2.5 text-xs">
                      {isPasswordValidLength ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-500 dark:bg-zinc-400" />
                      )}
                      <span
                        className={
                          isPasswordValidLength
                            ? "font-medium text-emerald-700 dark:text-emerald-400"
                            : "text-zinc-600 dark:text-zinc-300"
                        }
                      >
                        4 digits (can be your year of birth, e.g. 1990)
                      </span>
                    </div>
                  </div>
                )}

                {/* Switch between Login Password & Create New Password if customer hasn't set one yet */}
                {odooStep === "login_password" && (
                  <div className="flex items-center justify-between px-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setOdooStep("create_password");
                        setOdooPassword("");
                      }}
                      className="font-semibold text-[#c77e35] hover:underline"
                    >
                      First time logging in? Create a password
                    </button>
                    {odooIsPhone && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode("whatsapp");
                          setWaCountryIso(odooCountryIso);
                          setWaPhone(odooIdentifier);
                        }}
                        className="font-medium text-[#128C7E] hover:underline dark:text-[#25D366]"
                      >
                        Use WhatsApp OTP
                      </button>
                    )}
                  </div>
                )}

                {odooStep === "create_password" && (
                  <div className="flex items-center justify-between px-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setOdooStep("login_password");
                        setOdooPassword("");
                      }}
                      className="font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    >
                      Already have a password? Sign in
                    </button>
                  </div>
                )}

                {/* Pill-shaped Continue Button matching reference screenshot */}
                <button
                  type="submit"
                  disabled={
                    loading ||
                    (odooStep === "create_password" && !isPasswordValidLength)
                  }
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#3e220f] px-6 text-base font-semibold text-white transition-all hover:bg-[#573017] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                      <span>
                        {odooStep === "create_password"
                          ? "Creating Odoo Password..."
                          : "Signing in..."}
                      </span>
                    </>
                  ) : (
                    <span>Continue</span>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* MODE 2: WHATSAPP OTP AUTH (Native Odoo whatsapp_connector) */}
        {mode === "whatsapp" && (
          <div className="space-y-4">
            {waStep === "phone" ? (
              <form
                onSubmit={handleSendWhatsAppOtp}
                className="space-y-4 text-left"
              >
                <InternationalPhonePill
                  id="wa_phone"
                  label="WhatsApp phone number"
                  value={waPhone}
                  countryIso={waCountryIso}
                  allowEmail={false}
                  accentColor="whatsapp"
                  onChange={(raw, nextIso, e164, formattedDisplay) => {
                    setWaPhone(raw);
                    setWaCountryIso(nextIso);
                    setWaNormalizedPhone(e164);
                    setWaDisplayPhone(formattedDisplay);
                  }}
                />


                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 text-base font-semibold text-white shadow-xs transition-all hover:bg-[#1ebe5d] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <>
                      <Image
                        src="/whatsapp-official.png"
                        alt="WhatsApp"
                        width={20}
                        height={20}
                        className="h-5 w-5 object-contain shrink-0"
                      />
                      <span>Send Code</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleVerifyWhatsAppOtp}
                className="space-y-4 text-left"
              >
                <div className="relative flex h-14 w-full items-center justify-between rounded-full border border-zinc-300 bg-transparent px-5 dark:border-zinc-700">
                  <span className="absolute -top-2.5 left-4 bg-white px-1.5 text-xs font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                    WhatsApp number
                  </span>
                  <div className="flex items-center gap-2.5 truncate">
                    <img
                      src={getFlagUrl(activeWaCountry.iso2)}
                      alt={activeWaCountry.name}
                      width={22}
                      height={16}
                      className="h-4 w-5.5 shrink-0 rounded-[2px] object-cover shadow-2xs"
                    />
                    <span className="truncate text-base font-medium text-zinc-900 dark:text-zinc-100">
                      {waDisplayPhone || waNormalizedPhone || waPhone}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setWaStep("phone");
                      setWaOtp("");
                    }}
                    className="ml-3 shrink-0 text-sm font-semibold text-[#6366f1] transition-colors hover:text-[#4f46e5] dark:text-indigo-400"
                  >
                    Edit
                  </button>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="wa_otp"
                    className="block text-center text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                  >
                    6-Digit Verification Code
                  </Label>
                  <Input
                    id="wa_otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    value={waOtp}
                    onChange={(e) =>
                      setWaOtp(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="000000"
                    autoComplete="one-time-code"
                    className="h-14 rounded-full border-zinc-300 bg-transparent px-5 text-center font-mono text-xl font-bold tracking-[0.4em] indent-[0.4em] focus-visible:border-[#25D366] focus-visible:ring-[#25D366]/20 dark:border-zinc-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || waOtp.length !== 6}
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 text-base font-semibold text-white shadow-xs transition-all hover:bg-[#1ebe5d] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                      <span>Verifying with Odoo...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-5 w-5 shrink-0" />
                      <span>Continue</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center pt-1 text-xs">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSendWhatsAppOtp()}
                    className="inline-flex items-center gap-1.5 font-semibold text-[#128C7E] transition-colors hover:underline disabled:opacity-50 dark:text-[#25D366]"
                  >
                    <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                    <span>Resend 6-Digit Code</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-[11px] font-semibold uppercase tracking-widest">
            <span className="bg-white px-3 text-zinc-400 dark:bg-zinc-900">
              Or Quick Access
            </span>
          </div>
        </div>

        {/* MODE 3: PROTECTED GUEST SESSION */}
        <div className="space-y-2.5 text-center">
          <Button
            type="button"
            variant="outline"
            disabled={loading || guestLoading}
            onClick={handleContinueAsGuest}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-[#3e220f] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {guestLoading ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                <span>Starting Guest Session...</span>
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 shrink-0 text-[#c77e35]" />
                <span>Continue as Guest</span>
              </>
            )}
          </Button>
          <p className="mx-auto max-w-[340px] text-center text-xs leading-relaxed text-zinc-400">
            Browse, book pet grooming, and check out immediately without a
            password.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] dark:bg-zinc-950">
          <Loader2 className="h-6 w-6 animate-spin text-[#c77e35]" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
