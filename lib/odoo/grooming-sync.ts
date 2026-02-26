/**
 * Grooming Appointment Sync
 * Pushes website bookings to Odoo grooming.appointment model
 */

import { odoo } from "./client";

interface GroomingData {
    petType: "dog" | "cat" | string;
    petName: string;
    breedSize: string;
    package: string;
    price: number;
    appointmentDate: string; // ISO string
    appointmentTime: string; // HH:mm
    customerName: string;
    customerEmail?: string;
    customerPhone: string;
    specialNotes?: string;
    detangling: boolean;
    bookingNumber: string;
}

/**
 * Check if a grooming slot is available in Odoo
 * Requirement: Max 30 bookings per day.
 * Also check for exact duplicate slots to prevent double-booking same time.
 * @param appointmentDate ISO String of the requested date/time
 */
export async function checkGroomingAvailability(appointmentDate: string): Promise<boolean> {
    try {
        // 1. Check Daily Limit (Max 30)
        // Get YYYY-MM-DD
        const datePart = appointmentDate.split("T")[0];
        const startOfDay = `${datePart} 00:00:00`;
        const endOfDay = `${datePart} 23:59:59`;

        console.log(`🔎 Checking daily limit for ${datePart}...`);

        const dailyCount = await odoo.executeKw("grooming.appointment", "search_count", [[
            ["appointment_date", ">=", startOfDay],
            ["appointment_date", "<=", endOfDay],
            ["state", "!=", "cancelled"]
        ]]);

        if (dailyCount >= 30) {
            console.log(`  - ❌ Daily limit reached (${dailyCount}/30)`);
            return false;
        }

        // 2. Check Exact Slot (Optional: allow multiple per hour if staff permits,
        // but keeping it for now to avoid obvious collisions if not requested otherwise)
        const formattedFullDate = appointmentDate.replace("T", " ").substring(0, 19);
        const slotCount = await odoo.executeKw("grooming.appointment", "search_count", [[
            ["appointment_date", "=", formattedFullDate],
            ["state", "!=", "cancelled"]
        ]]);

        console.log(`  - Daily count: ${dailyCount}/30. Slot count: ${slotCount}.`);

        return slotCount === 0;
    } catch (error) {
        console.error("Failed to check availability:", error);
        // Fail open: If Odoo is down, allow booking to proceed (don't block sales)
        return true;
    }
}

/**
 * Push booking to Odoo
 */
export async function pushBookingToOdoo(data: GroomingData): Promise<string | null> {
    try {
        console.log(`📤 Syncing booking ${data.bookingNumber} to Odoo...`);

        // 1. Find or Create Customer (Partner)
        const partnerId = await getOrCreatePartner(data);
        console.log(`  - Customer ID: ${partnerId}`);

        // 2. Resolve Service ID (Package)
        // We match by name mostly, assuming names match roughly or we map them
        // In website: "standard", "premium", "super_premium"
        // In Odoo: "Standard Package", "Premium Package", etc.
        const serviceId = await getServiceByCode(data.package);
        console.log(`  - Service ID: ${serviceId}`);

        // 3. Create Appointment
        // Combine Date + Time
        // appointmentDate comes as "2024-01-01T00:00:00.000Z" usually from serialized Date

        const appointmentId = await odoo.executeKw("grooming.appointment", "create", [{
            partner_id: partnerId,
            pet_name: data.petName,
            pet_type: data.petType,
            pet_category: data.breedSize, // ensure values match Odoo selection
            service_type: "full_grooming",
            service_id: serviceId,
            appointment_date: data.appointmentDate.replace("T", " ").substring(0, 19), // Convert ISO to YYYY-MM-DD HH:MM:SS
            preferred_time: data.appointmentTime,
            has_detangling: data.detangling,
            notes: `Web Booking Ref: ${data.bookingNumber}\n${data.specialNotes || ""}`,
            state: "pending",
        }]);

        console.log(`  - ✅ Created Appointment ID: ${appointmentId}`);
        return String(appointmentId);

    } catch (error) {
        console.error("❌ Failed to push booking to Odoo:", error);
        return null;
    }
}

async function getOrCreatePartner(data: GroomingData): Promise<number> {
    // Prefer search by email when available, otherwise fallback to phone
    let existing: any[] = [];
    if (data.customerEmail) {
        existing = await odoo.searchRead(
            "res.partner",
            [["email", "=", data.customerEmail]],
            ["id"],
            1
        );
    }
    if ((!existing || existing.length === 0) && data.customerPhone) {
        existing = await odoo.searchRead(
            "res.partner",
            [["phone", "=", data.customerPhone]],
            ["id"],
            1
        );
    }

    if (existing.length > 0) {
        return existing[0].id;
    }

    // Create new
    const partnerPayload: any = {
        name: data.customerName,
        phone: data.customerPhone,
        customer_rank: 1, // Indicate it's a customer
    };
    if (data.customerEmail) partnerPayload.email = data.customerEmail;
    return await odoo.executeKw("res.partner", "create", [partnerPayload]);
}

async function getServiceByCode(pkgCode: string): Promise<number | false> {
    // Map code to name or better yet, add a 'code' field to grooming.service in Odoo?
    // For now, map to names we know exist in Odoo data
    const map: Record<string, string> = {
        "standard": "Standard Package",
        "premium": "Premium Package",
        "super_premium": "Super Premium Package"
    };

    const name = map[pkgCode];
    if (!name) return false;

    const services = await odoo.searchRead(
        "grooming.service",
        [["name", "ilike", name]], // Case insensitive match
        ["id"],
        1
    );

    return services.length > 0 ? services[0].id : false;
}
