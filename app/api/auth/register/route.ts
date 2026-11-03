import { NextResponse } from "next/server";
import { odoo } from "@/lib/odoo/client";
import { writeClient } from "@/sanity/lib/client";

export async function POST(request: Request) {
  try {
    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields (Name, Email, Password)" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const cleanedName = String(name).trim();
    const cleanedPhone = phone ? String(phone).trim() : "";

    // 1. Check if an active or inactive user already exists with this login
    const existingUsers = await odoo.executeKw(
      "res.users",
      "search_read",
      [[["login", "=", normalizedEmail]]],
      { fields: ["id", "partner_id", "active"], limit: 1, context: { active_test: false } }
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    // 2. Find existing partner by email or create a new customer partner
    const existingPartners = await odoo.searchRead(
      "res.partner",
      [["email", "=", normalizedEmail]],
      ["id"],
      1
    );

    let partnerId: number;
    if (existingPartners.length > 0) {
      partnerId = existingPartners[0].id;
    } else {
      partnerId = await odoo.executeKw("res.partner", "create", [
        {
          name: cleanedName,
          email: normalizedEmail,
          ...(cleanedPhone ? { phone: cleanedPhone } : {}),
          customer_rank: 1,
        },
      ]);
    }

    // 3. Look up base.group_portal so web signups are strictly Portal Users (never internal ERP staff)
    const portalGroupData = await odoo.searchRead(
      "ir.model.data",
      [
        ["module", "=", "base"],
        ["name", "=", "group_portal"],
      ],
      ["res_id"],
      1
    );
    const portalGroupId =
      portalGroupData.length > 0 && portalGroupData[0].res_id
        ? portalGroupData[0].res_id
        : 10;

    // 4. Create the Portal User in Odoo with password
    await odoo.executeKw(
      "res.users",
      "create",
      [
        {
          name: cleanedName,
          login: normalizedEmail,
          email: normalizedEmail,
          partner_id: partnerId,
          password: password,
          groups_id: [[6, 0, [portalGroupId]]],
          active: true,
        },
      ],
      {
        context: {
          no_reset_password: true,
          mail_create_nosubscribe: true,
        },
      }
    );

    // 5. Sync Customer record in Sanity
    const sanityUser = await writeClient.create({
      _type: "customer",
      name: cleanedName,
      email: normalizedEmail,
      odooPartnerId: partnerId,
      userId: partnerId.toString(),
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, userId: sanityUser._id });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register account" },
      { status: 500 }
    );
  }
}
