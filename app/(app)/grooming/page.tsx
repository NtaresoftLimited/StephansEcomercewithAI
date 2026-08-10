import { Metadata } from "next";
import { GroomingPageClient } from "./GroomingPageClient";
import { fetchGroomingPrices } from "@/lib/odoo/pricing";
import { PRICES as FALLBACK_PRICES } from "@/lib/constants/grooming";

import { groomingServiceJsonLd } from "@/lib/structured-data";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "Dog & Cat Grooming in Dar es Salaam | Stephan's Pet Store",
    description: "Professional pet grooming services in Dar es Salaam. We offer dog bathing, nail clipping, cat grooming, and spa treatments. Book your appointment online today!",
    alternates: {
        canonical: "/grooming",
    },
    openGraph: {
        title: "Professional Pet Grooming | Stephan's Pet Store Dar es Salaam",
        description: "Treat your furry friend to a spa day! Expert dog and cat grooming services at Stephan's Pet Store in Masaki, Dar es Salaam.",
        url: "https://www.stephanspetstore.co.tz/grooming",
        siteName: "Stephan's Pet Store",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Pet Grooming at Stephan's Pet Store",
            },
        ],
        locale: "en_TZ",
        type: "website",
    },
};

export default async function GroomingPage() {
    // We strictly use local constants for prices as requested to ensure alignment
    let prices = FALLBACK_PRICES;
    
    try {
        const odooPrices = await fetchGroomingPrices();
    } catch (e) {
        console.warn("Odoo pricing fetch failed", e);
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(groomingServiceJsonLd()) }}
            />
            <GroomingPageClient prices={prices} />
        </>
    );
}
