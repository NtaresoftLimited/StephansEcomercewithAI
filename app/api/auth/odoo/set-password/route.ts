import { NextRequest, NextResponse } from "next/server";
import { odoo } from "@/lib/odoo/client";
import { writeClient } from "@/sanity/lib/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = (body.identifier || "").trim();
    const password = (body.password || "").trim();
    const name = (body.name || "").trim();
    const otp = (body.otp || "").trim();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Phone/email and password are required." },
        { status: 400 }
      );
    }

    const digitCount = password.replace(/\D/g, "").length;
    if (digitCount < 4 && password.length < 4) {
      return NextResponse.json(
        {
          error:
            "Your password must contain 4 digits (can be your year of birth, e.g. 1992).",
        },
        { status: 400 }
      );
    }

    // Create/provision the Portal User & set password in Odoo ERP
    const provisioned = await odoo.setCustomerPortalPassword({
      identifier,
      password,
      name,
      otp: otp || undefined,
    });

    // Sync customer document in Sanity
    const effectiveEmail =
      provisioned.email ||
      `${provisioned.phone.replace(/\D/g, "") || provisioned.uid}@whatsapp.stephanspetstore.co.tz`;

    try {
      await writeClient.create({
        _type: "customer",
        name: provisioned.name,
        email: effectiveEmail,
        odooPartnerId: provisioned.partnerId,
        userId: provisioned.partnerId.toString(),
        createdAt: new Date().toISOString(),
      });
    } catch (sanityErr) {
      console.warn("⚠️ Sanity customer sync note:", sanityErr);
    }

    return NextResponse.json({
      success: true,
      login: provisioned.login,
      uid: provisioned.uid,
      partnerId: provisioned.partnerId,
    });
  } catch (error: any) {
    console.error("❌ Set Password Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create password in Odoo." },
      { status: 400 }
    );
  }
}
