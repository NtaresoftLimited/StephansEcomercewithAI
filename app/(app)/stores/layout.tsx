import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { localBusinessJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Pet Store Near Me in Dar es Salaam | Stephan's Locations",
  description:
    "Find Stephan's Pet Store in Dar es Salaam for pet food, accessories, grooming products and expert pet care support. Visit our Slipway Road location.",
  alternates: {
    canonical: "/stores",
  },
  openGraph: {
    title: "Pet Store Near Me in Dar es Salaam | Stephan's Pet Store",
    description:
      "Visit Stephan's Pet Store in Dar es Salaam for premium pet products, accessories and local pet care support.",
    url: "/stores",
    type: "website",
  },
};

export default function StoresLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={localBusinessJsonLd()} />
      {children}
    </>
  );
}
