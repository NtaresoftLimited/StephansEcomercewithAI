"use server";

import { client, writeClient } from "@/sanity/lib/client";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { auth } from "@/auth";
import { PRICES, VALID_TIMES } from "@/lib/constants/grooming";
import { formatPrice } from "@/lib/utils";

const bookingSchema = z.object({
    petType: z.enum(["dog", "cat", "small_animal"]),
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
    userId: z.string().optional().nullable(),
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
        // 0. Optional session check — booking works for guests too
        console.log("🔒 Step 0: Checking for session (optional)...");
        let session = null;
        try {
            // Only try auth() if we suspect we are logged in or in an environment where auth() is stable
            // Added explicit check for browser context or specific headers if needed, 
            // but for now just wrapping more carefully.
            const sessionPromise = auth();
            session = await Promise.race([
                sessionPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error("Auth timeout")), 5000))
            ]) as any;
            
            if (session?.user) {
                console.log(`   ✅ Session found for user: ${session.user.id}`);
                rawData.userId = session.user.id;
            } else {
                console.log("   ℹ️ No session — proceeding as guest booking");
            }
        } catch (authErr: any) {
            // Auth failure should NEVER block a guest booking
            console.warn("   ⚠️ Auth check failed or timed out (non-blocking):", authErr.message);
        }

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
            ...(data.userId ? { userId: data.userId } : {}),
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
            
            // Get odooPartnerId from session if available
            let odooPartnerId: number | undefined;
            if (session?.user && (session.user as any).odooPartnerId) {
                odooPartnerId = (session.user as any).odooPartnerId;
                console.log(`   🔗 Using Odoo Partner ID from session: ${odooPartnerId}`);
            }

            await pushBookingToOdoo({
                ...data,
                detangling: data.detangling || false,
                price: finalPrice,
                bookingNumber,
                appointmentDate: appointmentDateTime.toISOString(),
                odooPartnerId
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
        console.error("❌ Detailed Error Info:", {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            errorObject: error
        });
        return {
            success: false,
            error: `Booking failed: ${errorMessage}`,
        };
    }
}

export async function getLatestGroomingStatus() {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, error: "Not authenticated" };

        const odooPartnerId = (session.user as any).odooPartnerId;
        if (!odooPartnerId) return { success: false, error: "No Odoo partner linked" };

        const { odoo } = await import("@/lib/odoo/client");
        
        // Find latest active booking for this partner
        const appointments = await odoo.searchRead(
            "grooming.appointment",
            [
                ["partner_id", "=", odooPartnerId],
                ["state", "not in", ["cancelled"]]
            ],
            ["id", "state", "pet_name", "appointment_date", "name"],
            1 // limit to 1 (latest)
        );

        if (appointments.length === 0) {
            return { success: true, booking: null };
        }

        return { success: true, booking: appointments[0] };
    } catch (error: any) {
        console.error("Failed to fetch latest grooming status:", error);
        return { success: false, error: error.message || "Failed to fetch status" };
    }
}

export async function getMyGroomingBookings(userId: string) {
    try {
        const bookings = await client.fetch(
            `*[_type == "groomingBooking" && userId == $userId] | order(appointmentDate desc) {
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
            { userId }
        );

        return { success: true, bookings };
    } catch (error) {
        console.error("Failed to fetch grooming bookings:", error);
        return { success: false, error: "Failed to fetch bookings", bookings: [] };
    }
}

export async function getTakenTimeSlots(dateStr: string) {
    try {
        if (!dateStr) return { success: true, takenTimes: [] };
        
        const start = new Date(dateStr);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateStr);
        end.setHours(23, 59, 59, 999);
        
        // Find all bookings for this day that are not cancelled
        const bookings = await client.fetch(
            `*[_type == "groomingBooking" && appointmentDate >= $start && appointmentDate <= $end && status != "cancelled"] { appointmentDate }`,
            { start: start.toISOString(), end: end.toISOString() }
        );
        
        // Extract time (HH:MM) from the ISO string
        const takenTimes = bookings.map((b: any) => {
            const d = new Date(b.appointmentDate);
            const hh = String(d.getHours()).padStart(2, '0');
            const mm = String(d.getMinutes()).padStart(2, '0');
            return `${hh}:${mm}`;
        });

        return { success: true, takenTimes };
    } catch (e) {
        console.error("Failed to fetch taken slots:", e);
        return { success: false, takenTimes: [] };
    }
}
