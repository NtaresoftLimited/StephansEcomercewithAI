import { NextResponse } from "next/server";
import { odoo } from "@/lib/odoo/client";
import { writeClient } from "@/sanity/lib/client";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Check if user already exists in Odoo
    // We'll use search_read on res.users or res.partner
    // Actually, Odoo's res.users is for logins, res.partner is for customers
    // To allow login, we need a res.user.

    // Using the admin Odoo client to create the user
    console.log("Creating user in Odoo...");
    
    // First check if partner exists
    const existingPartners = await odoo.searchRead("res.partner", [["email", "=", email]], ["id"]);
    let partnerId: number;

    if (existingPartners.length > 0) {
      partnerId = existingPartners[0].id;
    } else {
      // Create new partner
      partnerId = await odoo.executeKw("res.partner", "create", [{
        name,
        email,
        customer_rank: 1,
      }]);
    }

    // Now create a User for this partner so they can login via XML-RPC
    // Note: Creating res.users might require specific permissions or configurations in Odoo
    // Alternatively, we can just use the email as login and set a password.
    // Odoo's 'sign up' usually handles this.
    // For this implementation, we assume we can create res.users
    try {
      await odoo.executeKw("res.users", "create", [{
        name,
        login: email,
        partner_id: partnerId,
        password: password,
        groups_id: [[6, 0, []]] // Minimal groups (Internal User usually, but maybe Portal)
      }]);
    } catch (e: any) {
       // If fail, maybe user already exists
       console.warn("User creation in Odoo failed (might already exist):", e.message);
    }

    // 2. Create in Sanity
    console.log("Creating user in Sanity...");
    const sanityUser = await writeClient.create({
      _type: "customer",
      name,
      email,
      odooPartnerId: partnerId,
      userId: partnerId.toString(),
    });

    return NextResponse.json({ success: true, userId: sanityUser._id });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Failed to register" }, { status: 500 });
  }
}
