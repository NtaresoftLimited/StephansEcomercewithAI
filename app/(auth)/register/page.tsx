"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Lock } from "lucide-react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, phone, password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Automatically sign the user in with their new Odoo Portal credentials
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        toast.success("Account created! Please sign in.");
        router.push("/login");
      } else {
        toast.success("Account created & signed in!");
        router.push("/");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f5] px-4 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-zinc-200/80 bg-white p-7 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-zinc-800 dark:bg-zinc-900">
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
          <h1 className="text-2xl font-bold uppercase tracking-tight text-[#3e220f] dark:text-zinc-100">
            Create Account
          </h1>
          <p className="mt-1.5 max-w-[300px] text-center text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            Join Tanzania&apos;s premier pet community &amp; sync your store purchases
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="block text-left text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="John Doe"
              autoComplete="name"
              className="h-11 rounded-lg border-zinc-200 bg-zinc-50/50 px-3.5 text-left text-sm dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="block text-left text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              autoComplete="email"
              className="h-11 rounded-lg border-zinc-200 bg-zinc-50/50 px-3.5 text-left text-sm dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="phone"
                className="block text-left text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
              >
                WhatsApp Number
              </Label>
              <span className="text-[11px] font-medium text-zinc-400">
                Optional
              </span>
            </div>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="0769 324 445 or +255..."
              autoComplete="tel"
              className="h-11 rounded-lg border-zinc-200 bg-zinc-50/50 px-3.5 text-left text-sm dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="block text-left text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
              >
                Password / 4-Digit PIN
              </Label>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                <Lock className="h-3 w-3 shrink-0" />
                4 digits (e.g. year of birth)
              </span>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              inputMode="numeric"
              required
              minLength={4}
              placeholder="e.g. 1990"
              autoComplete="new-password"
              className="h-11 rounded-lg border-zinc-200 bg-zinc-50/50 px-3.5 text-left text-sm dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#3e220f] px-4 text-sm font-bold text-white shadow-xs transition-all hover:bg-[#573017] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  <span>Provisioning Portal Account...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>Create Account</span>
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="border-t border-zinc-100 pt-4 text-center text-sm dark:border-zinc-800">
          <p className="text-center text-zinc-500 dark:text-zinc-400">
            Already have an account or prefer WhatsApp OTP?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#c77e35] transition-colors hover:text-[#3e220f] hover:underline dark:hover:text-amber-400"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
