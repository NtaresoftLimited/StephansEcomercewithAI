"use client";

import { useState } from "react";
import { MapPin, Phone, Clock, Star, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// Business details from Google My Business profile
const BUSINESS_INFO = {
    name: "Stephan's Pet Store",
    address: "11 Slipway Road, Msasani Peninsula",
    city: "Dar es Salaam",
    country: "Tanzania",
    phone: "+255 786 627 873",
    email: "info@stephanspetstore.co.tz",
    website: "https://www.stephanspetstore.co.tz",
    hours: [
        { day: "Monday", open: "9:00 AM", close: "8:30 PM" },
        { day: "Tuesday", open: "9:00 AM", close: "8:30 PM" },
        { day: "Wednesday", open: "9:00 AM", close: "8:30 PM" },
        { day: "Thursday", open: "9:00 AM", close: "8:30 PM" },
        { day: "Friday", open: "9:00 AM", close: "8:30 PM" },
        { day: "Saturday", open: "9:00 AM", close: "8:30 PM" },
        { day: "Sunday", open: "Closed", close: "" },
    ],
    // Google Maps coordinates for Slipway, Dar es Salaam
    coordinates: {
        lat: -6.7523,
        lng: 39.2758,
    },
    // Google Maps Place ID (find at: https://developers.google.com/maps/documentation/places/web-service/place-id)
    placeId: "ChIJXyzExample123", // TODO: Replace with actual Place ID
    googleMapsUrl: "https://maps.google.com/?q=Stephan's+Pet+Store,+11+Slipway+Road,+Dar+es+Salaam",
};

interface Review {
    author: string;
    rating: number;
    text: string;
    date: string;
}

// Static reviews until API integration
const SAMPLE_REVIEWS: Review[] = [
    {
        author: "John M.",
        rating: 5,
        text: "Amazing pet store! Wide selection of products and very helpful staff.",
        date: "2 weeks ago",
    },
    {
        author: "Sarah K.",
        rating: 5,
        text: "Best grooming service in Dar es Salaam. My dog looks fantastic!",
        date: "1 month ago",
    },
    {
        author: "Ahmed H.",
        rating: 4,
        text: "Great variety of pet food. Reasonable prices too.",
        date: "2 months ago",
    },
];

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"
                        }`}
                />
            ))}
        </div>
    );
}

export function GoogleBusinessProfile() {
    const [showAllHours, setShowAllHours] = useState(false);

    // Get current day status
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const todayHours = BUSINESS_INFO.hours.find((h) => h.day === today);
    const isOpen = todayHours && todayHours.open !== "Closed";

    return (
        <section className="bg-gradient-to-br from-[#6b3e1e]/5 to-[#6b3e1e]/10 py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-zinc-900">Visit Our Store</h2>
                    <p className="mt-2 text-zinc-600">Find us in Dar es Salaam</p>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Map & Directions */}
                    <div className="rounded-2xl overflow-hidden shadow-lg bg-white">
                        <iframe
                            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}&q=${encodeURIComponent(BUSINESS_INFO.name + ", " + BUSINESS_INFO.address + ", " + BUSINESS_INFO.city)}`}
                            width="100%"
                            height="300"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="bg-zinc-100"
                        />
                        <div className="p-6">
                            <div className="flex items-start gap-3 mb-4">
                                <MapPin className="h-5 w-5 text-[#6b3e1e] mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-zinc-900">{BUSINESS_INFO.address}</p>
                                    <p className="text-sm text-zinc-600">{BUSINESS_INFO.city}, {BUSINESS_INFO.country}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <Phone className="h-5 w-5 text-[#6b3e1e] flex-shrink-0" />
                                <a href={`tel:${BUSINESS_INFO.phone}`} className="text-zinc-900 hover:text-[#6b3e1e]">
                                    {BUSINESS_INFO.phone}
                                </a>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 text-[#6b3e1e] mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-sm font-medium ${isOpen ? "text-green-600" : "text-red-600"}`}>
                                            {isOpen ? "Open Now" : "Closed"}
                                        </span>
                                        {todayHours && (
                                            <span className="text-sm text-zinc-600">
                                                {todayHours.open} - {todayHours.close}
                                            </span>
                                        )}
                                    </div>

                                    {showAllHours && (
                                        <div className="mt-2 space-y-1">
                                            {BUSINESS_INFO.hours.map((h) => (
                                                <div key={h.day} className="flex justify-between text-sm">
                                                    <span className={h.day === today ? "font-medium" : "text-zinc-600"}>{h.day}</span>
                                                    <span className={h.day === today ? "font-medium" : "text-zinc-600"}>
                                                        {h.open === "Closed" ? "Closed" : `${h.open} - ${h.close}`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setShowAllHours(!showAllHours)}
                                        className="text-sm text-[#6b3e1e] hover:underline mt-1"
                                    >
                                        {showAllHours ? "Hide hours" : "Show all hours"}
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                                <Button asChild className="w-4/5 sm:flex-1 bg-[#6b3e1e] hover:bg-[#5a3319]">
                                    <a href={BUSINESS_INFO.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                                        <Navigation className="h-4 w-4 mr-2" />
                                        Get Directions
                                    </a>
                                </Button>
                                <Button asChild variant="outline" className="w-4/5 sm:flex-1">
                                    <a href={`tel:${BUSINESS_INFO.phone}`}>
                                        <Phone className="h-4 w-4 mr-2" />
                                        Call Now
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="rounded-2xl bg-white shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900">Customer Reviews</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <StarRating rating={5} />
                                    <span className="text-sm text-zinc-600">4.8 out of 5</span>
                                </div>
                            </div>
                            <a
                                href={BUSINESS_INFO.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-[#6b3e1e] hover:underline flex items-center gap-1"
                            >
                                View on Google
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>

                        <div className="space-y-4">
                            {SAMPLE_REVIEWS.map((review, index) => (
                                <div key={index} className="border-b border-zinc-100 pb-4 last:border-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-[#6b3e1e]/10 flex items-center justify-center">
                                                <span className="text-sm font-medium text-[#6b3e1e]">
                                                    {review.author.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900">{review.author}</p>
                                                <p className="text-xs text-zinc-500">{review.date}</p>
                                            </div>
                                        </div>
                                        <StarRating rating={review.rating} />
                                    </div>
                                    <p className="text-sm text-zinc-600">{review.text}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 text-center">
                            <Button asChild variant="outline" className="w-full">
                                <a
                                    href={BUSINESS_INFO.googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    See All Reviews on Google
                                    <ExternalLink className="h-4 w-4 ml-2" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
