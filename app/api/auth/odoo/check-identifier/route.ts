import { NextRequest, NextResponse } from "next/server";
import { odoo } from "@/lib/odoo/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = (body.identifier || "").trim();
    const countryIso = (body.countryIso || "tz").trim().toLowerCase();

    if (!identifier) {
      return NextResponse.json(
        { error: "Please enter a phone number or email address." },
        { status: 400 }
      );
    }

    const result = await odoo.checkCustomerIdentifier(identifier, countryIso);
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("❌ Identifier Check Error:", error);
    return NextResponse.json(
      { error: error.message || "Could not verify identifier." },
      { status: 400 }
    );
  }
}
