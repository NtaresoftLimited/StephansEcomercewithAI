"use server";

import { odoo } from "@/lib/odoo/client";

export async function testOdooConnection() {
    try {
        console.log("🔍 Diagnostic: Testing Odoo Connection...");
        console.log("   ODOO_URL:", process.env.ODOO_URL || "Using default");
        console.log("   ODOO_DB:", process.env.ODOO_DB || "Using default");
        console.log("   ODOO_USER:", process.env.ODOO_USER ? "PRESENT" : "MISSING");
        console.log("   ODOO_PASSWORD:", process.env.ODOO_PASSWORD ? "PRESENT" : "MISSING");

        // Try a simple search read on res.company
        const company = await odoo.searchRead("res.company", [], ["name"], 1);
        
        return {
            success: true,
            message: "Odoo connection successful!",
            data: company[0]
        };
    } catch (error: any) {
        console.error("❌ Diagnostic Odoo Connection Failed:", error);
        return {
            success: false,
            error: error.message,
            stack: error.stack
        };
    }
}
