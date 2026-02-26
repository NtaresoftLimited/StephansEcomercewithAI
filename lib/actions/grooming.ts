"use server";

import { client, writeClient } from "@/sanity/lib/client";
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
    appointmentDate: z.string().refine((date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bookingDate = new Date(date);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate >= today;
    }, {
        message: "Appointment date must be today or in the future",
    }),
    appointmentTime: z.string().refine((time) => VALID_TIMES.some((t) => t.value === time), {
        message: "Invalid appointment time",
    }),
    customerName: z.string().min(1, "Name is required"),
    // Make email optional; allow empty string
    customerEmail: z.union([z.string().email("Invalid email address"), z.literal("")]).optional(),
    customerPhone: z.string().min(1, "Phone number is required"),
    specialNotes: z.string().optional(),
    detangling: z.boolean().optional(),
    clerkUserId: z.string().optional().nullable(),
}).refine((data) => {
    const now = new Date();
    const [hours, minutes] = data.appointmentTime.split(":").map(Number);
    const appointmentDateTime = new Date(data.appointmentDate);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    // If it's today, the time must be in the future (allowing a 15 min buffer)
    if (appointmentDateTime.toDateString() === now.toDateString()) {
        const buffer = 15; // 15 minutes buffer
        const bufferTime = new Date(now.getTime() + buffer * 60000);
        return appointmentDateTime > bufferTime;
    }
    return true;
}, {
    message: "Selected time has already passed for today. Please pick a later time.",
    path: ["appointmentTime"],
});

type GroomingBookingData = z.infer<typeof bookingSchema>;

export async function createGroomingBooking(rawData: GroomingBookingData) {
    try {
        // 1. Validate Input
        console.log("📋 Step 1: Validating booking data...");
        console.log("   Raw data received:", JSON.stringify(rawData, null, 2));
        const data = bookingSchema.parse(rawData);
        console.log("   ✅ Validation passed");

        // 2. Recalculate Price Securely
        console.log("💰 Step 2: Calculating price...");
        const petPrices = PRICES[data.petType];
        if (!petPrices) throw new Error(`Invalid pet type: "${data.petType}"`);

        const packageLevels = petPrices[data.package];
        if (!packageLevels) throw new Error(`Invalid package: "${data.package}" for pet type "${data.petType}"`);

        const basePrice = packageLevels[data.breedSize];
        if (basePrice === undefined) throw new Error(`Invalid breed size: "${data.breedSize}" for package "${data.package}"`);

        let finalPrice = basePrice;
        if (data.detangling) {
            finalPrice += 30000;
        }
        console.log(`   ✅ Price calculated: ${finalPrice} TZS`);

        // 3. Check Odoo Availability & Generate Booking Number
        const appointmentDateTime = new Date(`${data.appointmentDate}T${data.appointmentTime}:00`);
        console.log("📅 Step 3: Checking availability for", appointmentDateTime.toISOString());

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
            console.log("   ✅ Time slot available");
        } catch (e) {
            console.error("   ⚠️ Availability check skipped:", e);
        }

        const bookingNumber = `GRM-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
        const additionalServices: string[] = [];
        if (data.detangling) {
            additionalServices.push("detangling");
        }

        // 4. Create in Sanity
        console.log("📝 Step 4: Creating booking in Sanity...");
        const doc = {
            _type: "groomingBooking" as const,
            bookingNumber,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            petType: data.petType,
            petName: data.petName,
            breedSize: data.breedSize,
            package: data.package,
            price: finalPrice,
            additionalServices,
            appointmentDate: appointmentDateTime.toISOString(),
            specialNotes: data.specialNotes || "",
            status: "pending",
            createdAt: new Date().toISOString(),
            ...(data.clerkUserId ? { clerkUserId: data.clerkUserId } : {}),
            ...(data.customerEmail ? { customerEmail: data.customerEmail } : {}),
        };

        console.log("   Sanity doc:", JSON.stringify(doc, null, 2));
        const booking = await writeClient.create(doc);
        console.log(`   ✅ Created in Sanity: ${booking._id}`);

        // 5. Sync to Odoo with Status Tracking
        console.log("🔄 Step 5: Syncing to Odoo...");
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
            console.log("   ✅ Odoo sync successful");
        } catch (syncErr) {
            console.error("   ❌ Odoo Sync Error:", syncErr);
        }

        // Log sync result (syncStatus field not in Sanity schema, just log)
        if (!syncSuccess) {
            console.warn(`   ⚠️ Booking ${bookingNumber} created in Sanity but Odoo sync failed`);
        }

        // 6. Send WhatsApp Confirmation
        console.log("💬 Step 6: Sending WhatsApp confirmation...");
        try {
            const whatsAppDateTime = new Date(`${data.appointmentDate}T${data.appointmentTime}:00`);
            const formattedDate = whatsAppDateTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const formattedTime = whatsAppDateTime.toLocaleTimeString('en-US', {
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
            console.log("   ✅ WhatsApp sent");
        } catch (whatsappError) {
            // Don't fail the booking if WhatsApp fails
            console.error('   ❌ WhatsApp notification failed:', whatsappError);
        }

        console.log(`🎉 Booking ${bookingNumber} completed successfully!`);
        return {
            success: true,
            bookingNumber,
            bookingId: booking._id,
        };
    } catch (error) {
        console.error("❌ Failed to create grooming booking:", error);
        if (error instanceof z.ZodError) {
            const issues = error.issues || (error as any).errors || [];
            const firstMessage = issues[0]?.message || "Validation error";
            console.error("   Zod validation errors:", JSON.stringify(issues, null, 2));
            return {
                success: false,
                error: firstMessage,
            };
        }
        // Surface the actual error message instead of a generic one
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return {
            success: false,
            error: `Booking failed: ${errorMessage}`,
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
