import { tool } from "ai";
import { z } from "zod";
import { createCheckoutSession, createGroomingCheckoutSession } from "@/lib/actions/checkout";

const checkoutSchema = z.object({
    type: z.enum(["product", "grooming"]).describe("Type of checkout: 'product' for cart items, 'grooming' for services"),
    items: z.array(z.object({
        productId: z.string(),
        name: z.string(),
        price: z.number(),
        quantity: z.number(),
        image: z.string().optional(),
    })).optional().describe("List of items to purchase (required for type='product')"),
    groomingDetails: z.object({
        bookingId: z.string(),
        bookingNumber: z.string(),
        petName: z.string(),
        packageName: z.string(),
        price: z.number(),
        appointmentDate: z.string(),
    }).optional().describe("Grooming booking details (required for type='grooming')"),
});

export const createCheckoutTool = tool({
    description: `Create a checkout session for products or grooming services.
  
  Use this tool when:
  1. The user wants to buy products they've found (type="product")
  2. The user has just booked a grooming appointment and wants to pay (type="grooming")
  
  For products:
  - You need to collect the list of products and quantities.
  - The tool will return a checkout URL.
  
  For grooming:
  - You MUST include the booking details returned from the bookGrooming tool.
  - The tool will return a checkout URL.
  `,
    parameters: checkoutSchema,
    execute: async (args: any) => {
        const { type, items, groomingDetails } = args;

        try {
            if (type === "product") {
                if (!items || items.length === 0) {
                    return {
                        success: false,
                        error: "No items provided for product checkout.",
                    };
                }

                const result = await createCheckoutSession(items);

                if (result.success && result.url) {
                    return {
                        success: true,
                        checkoutUrl: result.url,
                        message: "I've created your secure checkout link. Click below to complete your purchase!",
                    };
                } else {
                    return {
                        success: false,
                        error: result.error || "Failed to create product checkout.",
                    };
                }
            }

            if (type === "grooming") {
                if (!groomingDetails) {
                    return {
                        success: false,
                        error: "Missing grooming details for checkout.",
                    };
                }

                const result = await createGroomingCheckoutSession(
                    groomingDetails.bookingId,
                    groomingDetails.bookingNumber,
                    groomingDetails.petName,
                    groomingDetails.packageName,
                    groomingDetails.price,
                    groomingDetails.appointmentDate
                );

                if (result.success && result.url) {
                    return {
                        success: true,
                        checkoutUrl: result.url,
                        message: `Checkout ready for ${groomingDetails.petName}'s grooming. Click below to pay securely.`,
                    };
                } else {
                    return {
                        success: false,
                        error: result.error || "Failed to create grooming checkout.",
                    };
                }
            }

            return {
                success: false,
                error: "Invalid checkout type.",
            };
        } catch (error) {
            console.error("Error in createCheckout tool:", error);
            return {
                success: false,
                error: "An unexpected error occurred while creating the checkout.",
            };
        }
    },
} as any);
