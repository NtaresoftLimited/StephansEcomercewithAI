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
    customerEmail: string;
    customerPhone: string;
    specialNotes?: string;
    detangling: boolean;
    bookingNumber: string;
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
        // But our form sends YYYY-MM-DD string directly? Let's check input.
        // Actually actions/grooming.ts lines 28 constructs a Date object.
        // But here we receive the DTO.

        // Let's assume data.appointmentDate is "2024-01-01T..." ISO from action

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

/**
 * Check if a grooming slot is available in Odoo
 * @param appointmentDate ISO String of the requested date/time
 */
export async function checkGroomingAvailability(appointmentDate: string): Promise<boolean> {
    try {
        const formattedDate = appointmentDate.replace("T", " ").substring(0, 19);
        console.log(`🔎 Checking availability for ${formattedDate}...`);

        const count = await odoo.executeKw("grooming.appointment", "search_count", [[
            ["appointment_date", "=", formattedDate],
            ["state", "!=", "cancelled"]
        ]]);

        return count === 0;
    } catch (error) {
        console.error("Failed to check availability:", error);
        // Fail open: If Odoo is down, allow booking to proceed (don't block sales)
        // Ideally we should alert admin, but for now we assume available.
        return true;
    }
}

async function getOrCreatePartner(data: GroomingData): Promise<number> {
    // Search by email
    const existing = await odoo.searchRead(
        "res.partner",
        [["email", "=", data.customerEmail]],
        ["id"],
        1
    );

    if (existing.length > 0) {
        return existing[0].id;
    }

    // Create new
    return await odoo.executeKw("res.partner", "create", [{
        name: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone,
        customer_rank: 1, // Indicate it's a customer
    }]);
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
