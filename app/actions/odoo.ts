"use server";

import { odoo } from "@/lib/odoo/client";

export async function getPaymentMethods() {
    try {
        // Fetch payment methods from Odoo POS
        // We filter for active methods. 
        // Typically model is 'pos.payment.method'
        const methods = await odoo.executeKw(
            "pos.payment.method",
            "search_read",
            [[["active", "=", true]]], // Domain: active=True
            {
                fields: ["id", "name", "image", "journal_id"],
            }
        );

        // Process image if needed (Odoo returns base64 or false)
        return methods.map((method: any) => ({
            id: method.id,
            name: method.name,
            image: method.image, // usually binary
            journalId: method.journal_id?.[0], // journal_id is usually [id, name]
        }));
    } catch (error) {
        console.error("Error fetching payment methods:", error);
        // Return empty array to allow graceful fallback UI
        return [];
    }
}
