import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us | Stephan's Pet Store Dar es Salaam",
    description: "Get in touch with Stephan's Pet Store. Located at 11 Slipway Rd, Masaki, Dar es Salaam. Call us at +255 786 627 873 for pet food, accessories, and grooming services.",
    alternates: {
        canonical: "/contact",
    },
    openGraph: {
        title: "Contact Stephan's Pet Store | Dar es Salaam",
        description: "Visit Stephan's Pet Store at 11 Slipway Rd, Masaki. Contact us for premium pet supplies, dog & cat food, and expert grooming services.",
        url: "https://www.stephanspetstore.co.tz/contact",
        siteName: "Stephan's Pet Store",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Contact Stephan's Pet Store",
            },
        ],
        locale: "en_TZ",
        type: "website",
    },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
