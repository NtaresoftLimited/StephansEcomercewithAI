import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Stephan's Pet Store | Tanzania's Premier Pet Shop",
    template: "%s | Stephan's Pet Store",
  },
  description: "Tanzania's leading pet store. Shop premium pet food, accessories, grooming services & more. Free delivery in Dar es Salaam. Visit us at Slipway Road.",
  keywords: ["pet store Tanzania", "pet shop Dar es Salaam", "dog food Tanzania", "cat food", "pet grooming", "pet accessories", "Stephan's Pet Store"],
  authors: [{ name: "Stephan's Pet Store" }],
  creator: "Stephan's Pet Store",
  publisher: "Stephan's Pet Store",
  metadataBase: new URL("https://www.stephanspetstore.co.tz"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_TZ",
    url: "https://www.stephanspetstore.co.tz",
    siteName: "Stephan's Pet Store",
    title: "Stephan's Pet Store | Tanzania's Premier Pet Shop",
    description: "Premium pet supplies, food & grooming services in Dar es Salaam, Tanzania. Shop now for your furry friends!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Stephan's Pet Store - Tanzania's Premier Pet Shop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stephan's Pet Store | Tanzania's Premier Pet Shop",
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
  themeColor: "#6b3e1e",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#6b3e1e" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Stephan's" />
        <link rel="apple-touch-icon" href="/favicon.png" />
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
