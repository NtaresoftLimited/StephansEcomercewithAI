"use server";

import { client } from "@/sanity/lib/client";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { PRICES, VALID_TIMES } from "@/lib/constants/grooming";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

// Helper function to format price
function formatPrice(price: number): string {
    return new Intl.NumberFormat("en-TZ").format(price) + " TZS";
}

const bookingSchema = z.object({
    petType: z.enum(["dog", "cat"]),
    petName: z.string().min(1, "Pet name is required"),
    breedSize: z.string().min(1, "Breed size is required"),
    package: z.string().min(1, "Package is required"),
    appointmentDate: z.string().refine((date) => new Date(date) > new Date(), {
        message: "Appointment date must be in the future",
    }),
    appointmentTime: z.string().refine((time) => VALID_TIMES.some((t) => t.value === time), {
        message: "Invalid appointment time",
    }),
    customerName: z.string().min(1, "Name is required"),
    customerEmail: z.string().email("Invalid email address"),
    customerPhone: z.string().min(1, "Phone number is required"),
    specialNotes: z.string().optional(),
    detangling: z.boolean().optional(),
    clerkUserId: z.string().optional().nullable(),
});

type GroomingBookingData = z.infer<typeof bookingSchema>;

export async function createGroomingBooking(rawData: GroomingBookingData) {
    try {
        // 1. Validate Input
        const data = bookingSchema.parse(rawData);

        // 2. Recalculate Price Securely
        const petPrices = PRICES[data.petType];
        if (!petPrices) throw new Error("Invalid pet type");

        const packageLevels = petPrices[data.package];
        if (!packageLevels) throw new Error("Invalid package");

        const basePrice = packageLevels[data.breedSize];
        if (basePrice === undefined) throw new Error("Invalid breed size");

        let finalPrice = basePrice;
        if (data.detangling) {
            finalPrice += 30000;
        }

        // 3. Check Odoo Availability & Generate Booking Number
        const appointmentDateTime = new Date(`${data.appointmentDate}T${data.appointmentTime}:00`);

        try {
            // Dynamic import to avoid loading Odoo client if not needed
            const { checkGroomingAvailability } = await import("@/lib/odoo/grooming-sync");
            const isAvailable = await checkGroomingAvailability(appointmentDateTime.toISOString());

            if (!isAvailable) {
                return {
                    success: false,
                    error: "This time slot is just booked! Please select another time.",
                };
            }
        } catch (e) {
            console.error("Availability check skipped:", e);
        }

        const bookingNumber = `GRM-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
        const additionalServices: string[] = [];
        if (data.detangling) {
            additionalServices.push("detangling");
        }

        // 4. Create in Sanity
        const booking = await client.create({
            _type: "groomingBooking",
            bookingNumber,
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            customerPhone: data.customerPhone,
            clerkUserId: data.clerkUserId || null,
            petType: data.petType,
            petName: data.petName,
            breedSize: data.breedSize,
            package: data.package,
            price: finalPrice, // Use server-calculated price
            additionalServices,
            appointmentDate: appointmentDateTime.toISOString(),
            specialNotes: data.specialNotes || "",
            status: "pending",
            syncStatus: "pending", // Track sync status
            createdAt: new Date().toISOString(),
        });

        // 5. Sync to Odoo with Status Tracking
        let syncSuccess = false;
        try {
            const { pushBookingToOdoo } = await import("@/lib/odoo/grooming-sync");
            await pushBookingToOdoo({
                ...data,
                detangling: data.detangling || false,
                price: finalPrice,
                bookingNumber,
                appointmentDate: appointmentDateTime.toISOString(),
            });
            syncSuccess = true;
        } catch (syncErr) {
            console.error("Odoo Sync Error:", syncErr);
        }

        // Update Sync Status
        await client.patch(booking._id).set({
            syncStatus: syncSuccess ? "success" : "failed"
        }).commit();

        // 6. Send WhatsApp Confirmation
        try {
            const appointmentDateTime = new Date(`${data.appointmentDate}T${data.appointmentTime}:00`);
            const formattedDate = appointmentDateTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const formattedTime = appointmentDateTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const message = `🐾 *Grooming Appointment Confirmed!* 🐾

Hello ${data.customerName}!

Thank you for booking with Stephan's Pet Store. Your grooming appointment has been confirmed.

📋 *Booking Details:*
• Booking #: ${bookingNumber}
• Pet Name: ${data.petName}
• Pet Type: ${data.petType === 'dog' ? '🐕 Dog' : '🐱 Cat'}
• Package: ${data.package.replace('_', ' ').toUpperCase()}
• Date: ${formattedDate}
• Time: ${formattedTime}
• Price: ${formatPrice(finalPrice)}

📍 *Location:*
11 Slipway Road, Dar es Salaam

⏰ *Please Note:*
- Arrive 10 minutes early
- Bring your pet's vaccination records
- We're closed on Sundays

Need to reschedule? Call us at +255 769 324 445

See you soon! 🎉`;

            await sendWhatsAppMessage(data.customerPhone, message);
        } catch (whatsappError) {
            // Don't fail the booking if WhatsApp fails
            console.error('WhatsApp notification failed:', whatsappError);
        }

        return {
            success: true,
            bookingNumber,
            bookingId: booking._id,
        };
    } catch (error) {
        console.error("Failed to create grooming booking:", error);
        if (error instanceof z.ZodError) {
            // Zod v4 uses .issues instead of .errors
            return {
                success: false,
                error: error.issues[0]?.message || "Validation error",
            };
        }
        return {
            success: false,
            error: "Failed to create booking. Please try again.",
        };
    }
}

export async function getMyGroomingBookings(clerkUserId: string) {
    try {
        const bookings = await client.fetch(
            `*[_type == "groomingBooking" && clerkUserId == $clerkUserId] | order(appointmentDate desc) {
        _id,
        bookingNumber,
        petName,
        petType,
        package,
        price,
        appointmentDate,
        status,
        syncStatus
      }`,
            { clerkUserId }
        );

        return { success: true, bookings };
    } catch (error) {
        console.error("Failed to fetch grooming bookings:", error);
        return { success: false, error: "Failed to fetch bookings", bookings: [] };
    }
}
