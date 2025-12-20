"use server";

import { client } from "@/sanity/lib/client";
import { v4 as uuidv4 } from "uuid";

interface GroomingBookingData {
    petType: "dog" | "cat";
    petName: string;
    breedSize: string;
    package: string;
    price: number;
    appointmentDate: string;
    appointmentTime: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    specialNotes?: string;
    detangling: boolean;
    clerkUserId?: string;
}

export async function createGroomingBooking(data: GroomingBookingData) {
    try {
        // Generate booking number
        const bookingNumber = `GRM-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;

        // Combine date and time
        const appointmentDateTime = new Date(`${data.appointmentDate}T${data.appointmentTime}:00`);

        // Build additional services array
        const additionalServices: string[] = [];
        if (data.detangling) {
            additionalServices.push("detangling");
        }

        // Create booking in Sanity
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
            price: data.price,
            additionalServices,
            appointmentDate: appointmentDateTime.toISOString(),
            specialNotes: data.specialNotes || "",
            status: "pending",
            createdAt: new Date().toISOString(),
        });

        // TODO: Send confirmation email
        // TODO: Send WhatsApp notification

        return {
            success: true,
            bookingNumber,
            bookingId: booking._id,
        };
    } catch (error) {
        console.error("Failed to create grooming booking:", error);
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
        status
      }`,
            { clerkUserId }
        );

        return { success: true, bookings };
    } catch (error) {
        console.error("Failed to fetch grooming bookings:", error);
        return { success: false, error: "Failed to fetch bookings", bookings: [] };
    }
}
