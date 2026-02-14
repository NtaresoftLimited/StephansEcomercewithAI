import { tool } from "ai";
import { z } from "zod";
import { createGroomingBooking } from "@/lib/actions/grooming";

// Price lookup table
const PRICES: Record<string, Record<string, Record<string, number>>> = {
    dog: {
        standard: { mini: 45000, small: 50000, medium: 60000, large: 70000 },
        premium: { mini: 50000, small: 60000, medium: 70000, large: 80000 },
        super_premium: { mini: 60000, small: 75000, medium: 85000, large: 90000 },
    },
    cat: {
        standard: { kitten: 45000, adult_cat: 60000 },
        premium: { kitten: 60000, adult_cat: 75000 },
        super_premium: { kitten: 75000, adult_cat: 85000 },
    },
};

const DETANGLING_FEE = 30000;

function formatPrice(price: number): string {
    return new Intl.NumberFormat("en-TZ").format(price) + " TZS";
}

function calculatePrice(petType: string, packageType: string, breedSize: string, detangling: boolean): number {
    const basePrice = PRICES[petType]?.[packageType]?.[breedSize] || 0;
    return basePrice + (detangling ? DETANGLING_FEE : 0);
}

const bookGroomingSchema = z.object({
    petType: z.enum(["dog", "cat"]).describe("Type of pet: 'dog' or 'cat'"),
    petName: z.string().describe("Name of the pet"),
    breedSize: z.string().describe("Size of the breed. For dogs: 'mini', 'small', 'medium', 'large'. For cats: 'kitten', 'adult_cat'"),
    packageType: z.enum(["standard", "premium", "super_premium"]).describe("Grooming package: 'standard', 'premium', or 'super_premium'"),
    appointmentDate: z.string().describe("Appointment date in YYYY-MM-DD format"),
    appointmentTime: z.string().describe("Appointment time in HH:mm format (e.g., '14:00' for 2pm)"),
    customerPhone: z.string().describe("Customer's phone number"),
    detangling: z.boolean().default(false).describe("Whether to add detangling service (+30,000 TZS)"),
    specialNotes: z.string().optional().describe("Any special notes or instructions"),
});

export function createBookGroomingTool(userId: string | null, userEmail: string | null, userName: string | null) {
    return tool({
        description: `Book a grooming appointment for a pet. Use this when the user wants to schedule grooming services.
        
IMPORTANT: Before calling this tool, you MUST collect ALL required information from the user:
- Pet type (dog or cat)
- Pet name
- Breed size (for dogs: mini, small, medium, large; for cats: kitten, adult_cat)
- Package (standard, premium, or super_premium)
- Appointment date (YYYY-MM-DD format)
- Appointment time (HH:mm format, e.g., "14:00")
- Customer phone number

If the user hasn't provided all information, ask for it conversationally before calling this tool.`,
        parameters: bookGroomingSchema,
        execute: async (args: any) => {
            const {
                petType,
                petName,
                breedSize,
                packageType,
                appointmentDate,
                appointmentTime,
                customerPhone,
                detangling,
                specialNotes
            } = args;

            try {
                // Validate breed size for pet type
                const validDogSizes = ["mini", "small", "medium", "large"];
                const validCatSizes = ["kitten", "adult_cat"];

                if (petType === "dog" && !validDogSizes.includes(breedSize)) {
                    return {
                        success: false,
                        error: `Invalid breed size for dog. Please specify: mini, small, medium, or large.`,
                    };
                }

                if (petType === "cat" && !validCatSizes.includes(breedSize)) {
                    return {
                        success: false,
                        error: `Invalid breed size for cat. Please specify: kitten or adult_cat.`,
                    };
                }

                // Calculate price
                const price = calculatePrice(petType, packageType, breedSize, detangling);

                if (price === 0) {
                    return {
                        success: false,
                        error: "Could not calculate price. Please verify the pet type, size, and package.",
                    };
                }

                // Create the booking (price is calculated server-side for security)
                const result = await createGroomingBooking({
                    petType,
                    petName,
                    breedSize,
                    package: packageType,
                    appointmentDate,
                    appointmentTime,
                    customerName: userName || "Guest",
                    customerEmail: userEmail || "",
                    customerPhone,
                    specialNotes: specialNotes || "",
                    detangling,
                    clerkUserId: userId || undefined,
                });

                if (result.success) {
                    const packageLabels: Record<string, string> = {
                        standard: "Standard",
                        premium: "Premium",
                        super_premium: "Super Premium",
                    };

                    return {
                        success: true,
                        bookingNumber: result.bookingNumber,
                        bookingId: result.bookingId,
                        petName,
                        petType,
                        package: packageLabels[packageType],
                        breedSize,
                        appointmentDate,
                        appointmentTime,
                        price,
                        priceFormatted: formatPrice(price),
                        detangling,
                        message: `Booking confirmed! ${petName}'s ${packageLabels[packageType]} grooming appointment is scheduled.`,
                    };
                } else {
                    return {
                        success: false,
                        error: result.error || "Failed to create booking",
                    };
                }
            } catch (error) {
                console.error("Error in bookGrooming tool:", error);
                return {
                    success: false,
                    error: "An unexpected error occurred while creating the booking.",
                };
            }
        },
    } as any);
}

// Tool to get grooming prices
export const getGroomingPricesTool = tool({
    description: "Get grooming package prices for dogs and cats. Use this when users ask about grooming costs.",
    parameters: z.object({
        petType: z.enum(["dog", "cat"]).optional().describe("Filter by pet type"),
    }),
    execute: async ({ petType }: any) => {
        const prices = [];

        if (!petType || petType === "dog") {
            prices.push({
                petType: "dog",
                packages: [
                    {
                        name: "Standard",
                        description: "Bath, blow dry, ear cleaning",
                        prices: {
                            mini: formatPrice(45000),
                            small: formatPrice(50000),
                            medium: formatPrice(60000),
                            large: formatPrice(70000),
                        },
                    },
                    {
                        name: "Premium",
                        description: "Standard + nail trim, teeth brushing",
                        prices: {
                            mini: formatPrice(50000),
                            small: formatPrice(60000),
                            medium: formatPrice(70000),
                            large: formatPrice(80000),
                        },
                    },
                    {
                        name: "Super Premium",
                        description: "Premium + flea treatment, paw balm, cologne",
                        prices: {
                            mini: formatPrice(60000),
                            small: formatPrice(75000),
                            medium: formatPrice(85000),
                            large: formatPrice(90000),
                        },
                    },
                ],
            });
        }

        if (!petType || petType === "cat") {
            prices.push({
                petType: "cat",
                packages: [
                    {
                        name: "Standard",
                        description: "Bath, blow dry, ear cleaning",
                        prices: {
                            kitten: formatPrice(45000),
                            adult_cat: formatPrice(60000),
                        },
                    },
                    {
                        name: "Premium",
                        description: "Standard + nail trim, teeth brushing",
                        prices: {
                            kitten: formatPrice(60000),
                            adult_cat: formatPrice(75000),
                        },
                    },
                    {
                        name: "Super Premium",
                        description: "Premium + flea treatment, paw balm, cologne",
                        prices: {
                            kitten: formatPrice(75000),
                            adult_cat: formatPrice(85000),
                        },
                    },
                ],
            });
        }

        return {
            prices,
            additionalServices: [
                { name: "Detangling", price: formatPrice(DETANGLING_FEE) },
            ],
            note: "Prices are in Tanzania Shillings (TZS). Visit /grooming to book online.",
        };
    },
} as any);
