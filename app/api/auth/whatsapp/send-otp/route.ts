import { NextRequest, NextResponse } from "next/server";
import { odoo } from "@/lib/odoo/client";
import { normalizeInternationalPhone } from "@/lib/phone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Simple in-memory rate limiting per IP / phone (5 requests per 5 minutes)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxRequests = 5, windowMs = 5 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) {
    return false;
  }
  entry.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawPhone = (body.phone || "").trim();
    const countryIso = (body.countryIso || "tz").trim().toLowerCase();
    const customerName = (body.name || "").trim();

    if (!rawPhone) {
      return NextResponse.json(
        { error: "Please enter your WhatsApp phone number." },
        { status: 400 }
      );
    }

    const parsedPhone = normalizeInternationalPhone(rawPhone, countryIso);
    const targetE164 = parsedPhone.e164 || rawPhone;

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const rateKey = `${clientIp}:${targetE164.replace(/\D/g, "").slice(-9)}`;

    if (!checkRateLimit(rateKey)) {
      return NextResponse.json(
        {
          error:
            "Too many code requests. Please wait a few minutes before requesting another code.",
        },
        { status: 429 }
      );
    }

    // Trigger Odoo's native WhatsApp Portal User + OTP generation & WhatsApp gateway dispatch
    const otpResult = await odoo.requestWhatsAppOtp(targetE164, customerName);

    if (!otpResult.sent) {
      return NextResponse.json(
        {
          error:
            "Unable to deliver WhatsApp verification code right now. Please verify your number or try Email Sign In.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      phone: otpResult.phone,
      displayPhone: parsedPhone.formattedInternational || otpResult.phone,
      countryIso: parsedPhone.country.iso2,
      message: `We sent a 6-digit verification code to your WhatsApp (${parsedPhone.formattedInternational || otpResult.phone}).`,
    });
  } catch (error: any) {
    console.error("❌ WhatsApp OTP Request Error:", error);
    const message =
      error?.message && !error.message.includes("HTTP")
        ? error.message
        : "Please enter a valid WhatsApp number (e.g. 0769 324 445 or +255769324445).";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
