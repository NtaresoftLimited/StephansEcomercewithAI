import { defineType, defineField } from "sanity";
import { CalendarIcon } from "@sanity/icons";

export const groomingBookingType = defineType({
    name: "groomingBooking",
    title: "Grooming Booking",
    type: "document",
    icon: CalendarIcon,
    fields: [
        defineField({
            name: "bookingNumber",
            title: "Booking Number",
            type: "string",
            readOnly: true,
        }),
        defineField({
            name: "customerName",
            title: "Customer Name",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "customerEmail",
            title: "Customer Email",
            type: "string",
            validation: (Rule) => Rule.required().email(),
        }),
        defineField({
            name: "customerPhone",
            title: "Customer Phone",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "clerkUserId",
            title: "Clerk User ID",
            type: "string",
            description: "Links to authenticated user",
        }),
        defineField({
            name: "petType",
            title: "Pet Type",
            type: "string",
            options: {
                list: [
                    { title: "Dog", value: "dog" },
                    { title: "Cat", value: "cat" },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "petName",
            title: "Pet Name",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "breedSize",
            title: "Breed Size",
            type: "string",
            options: {
                list: [
                    { title: "Mini Breeds", value: "mini" },
                    { title: "Small Breeds", value: "small" },
                    { title: "Medium Breeds", value: "medium" },
                    { title: "Large Breeds", value: "large" },
                    { title: "Kitten (2-7 months)", value: "kitten" },
                    { title: "Adult Cat (7+ months)", value: "adult_cat" },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "package",
            title: "Package",
            type: "string",
            options: {
                list: [
                    { title: "Standard Package", value: "standard" },
                    { title: "Premium Package", value: "premium" },
                    { title: "Super Premium Package", value: "super_premium" },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "price",
            title: "Price (TZS)",
            type: "number",
            validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
            name: "additionalServices",
            title: "Additional Services",
            type: "array",
            of: [{ type: "string" }],
            options: {
                list: [
                    { title: "Detangling Hair (+30,000 TZS)", value: "detangling" },
                ],
            },
        }),
        defineField({
            name: "appointmentDate",
            title: "Appointment Date",
            type: "datetime",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "specialNotes",
            title: "Special Notes",
            type: "text",
            description: "Any special instructions or concerns about the pet",
        }),
        defineField({
            name: "status",
            title: "Booking Status",
            type: "string",
            options: {
                list: [
                    { title: "Pending", value: "pending" },
                    { title: "Confirmed", value: "confirmed" },
                    { title: "In Progress", value: "in_progress" },
                    { title: "Completed", value: "completed" },
                    { title: "Cancelled", value: "cancelled" },
                ],
            },
            initialValue: "pending",
        }),
        defineField({
            name: "createdAt",
            title: "Created At",
            type: "datetime",
            readOnly: true,
        }),
    ],
    preview: {
        select: {
            title: "petName",
            subtitle: "customerName",
            status: "status",
            date: "appointmentDate",
        },
        prepare({ title, subtitle, status, date }) {
            const formattedDate = date
                ? new Date(date).toLocaleDateString()
                : "No date";
            return {
                title: `${title} - ${subtitle}`,
                subtitle: `${status?.toUpperCase()} | ${formattedDate}`,
            };
        },
    },
});
