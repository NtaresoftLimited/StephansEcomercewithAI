import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Stephan's Pet Store | Premier Pet Shop in Dar es Salaam",
    template: "%s | Stephan's Pet Store",
  },
  description: "Tanzania's leading pet store. Shop premium pet food, accessories, dog beds, dog cages, grooming services & more. Free delivery in Dar es Salaam, Tanzania. Visit us at Slipway Road or Mikocheni.",
  keywords: [
    "pet store Tanzania",
    "pet shop Dar es Salaam",
    "pet shop near me",
    "dog food Tanzania",
    "cat food tanzania",
    "pet grooming dar es salaam",
    "pet accessories",
    "Stephan's Pet Store",
    "balang pet bed",
    "dog cages for sale",
    "josera tanzania",
    "Bravecto tanzania",
    "Bioline cat shampoo",
    "xxxl dog beds"
  ],
  authors: [{ name: "Stephan's Pet Store" }],
  creator: "Stephan's Pet Store",
  publisher: "Stephan's Pet Store",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_TZ",
    url: "https://www.stephanspetstore.co.tz",
    siteName: "Stephan's Pet Store",
    title: "Stephan's Pet Store | Premier Pet Shop in Dar es Salaam",
    description: "Premium pet supplies, food, dog beds, and grooming services in Dar es Salaam, Tanzania. Shop now for your furry friends!",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Stephan's Pet Store - Tanzania's Premier Pet Shop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stephan's Pet Store | Premier Pet Shop in Dar es Salaam",
    description: "Premium pet supplies, food & grooming services in Dar es Salaam, Tanzania.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
    shortcut: "/favicon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Stephan's Pet Store",
  },
  verification: {
    // Add your verification codes here
    // google: "your-google-verification-code",
  },
};

export const viewport: Viewport = {
  themeColor: "#6b3e1e",
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "PetStore",
      "@id": "https://www.stephanspetstore.co.tz/#store-masaki",
      "name": "Stephan's Pet Store - Masaki Branch",
      "description": "Tanzania's premier pet shop in Dar es Salaam. Premium dog food, cat food, dog beds, dog cages, and professional grooming services.",
      "url": "https://www.stephanspetstore.co.tz",
      "telephone": "+255786627873",
      "priceRange": "$$",
      "image": "https://www.stephanspetstore.co.tz/logo.png",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "11 Slipway Rd, Masaki",
        "addressLocality": "Dar es Salaam",
        "addressCountry": "TZ"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -6.749,
        "longitude": 39.278
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "20:30"
      }
    },
    {
      "@type": "PetStore",
      "@id": "https://www.stephanspetstore.co.tz/#store-mikocheni",
      "name": "Stephan's Pet Store - Mikocheni Branch",
      "description": "Premium pet supplies, accessories, food, and grooming services in Mikocheni, Dar es Salaam.",
      "url": "https://www.stephanspetstore.co.tz",
      "telephone": "+255769324445",
      "priceRange": "$$",
      "image": "https://www.stephanspetstore.co.tz/logo.png",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "58 Mikocheni A",
        "addressLocality": "Dar es Salaam",
        "addressCountry": "TZ"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -6.768,
        "longitude": 39.256
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "20:30"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Stephan's" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
