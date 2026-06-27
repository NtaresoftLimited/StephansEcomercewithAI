import { absoluteUrl, buildProductDescription, SITE_NAME, SITE_URL } from "@/lib/seo";

export const BUSINESS_NAME = "Stephan's Pet Store";
export const BUSINESS_PHONE = "+255786627873";
export const BUSINESS_WHATSAPP = "+255769324445";
export const BUSINESS_EMAIL = "info@stephanspetstore.co.tz";
export const BUSINESS_ADDRESS = {
  streetAddress: "Slipway Road",
  addressLocality: "Dar es Salaam",
  addressCountry: "TZ",
};

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: BUSINESS_NAME,
    url: SITE_URL,
    email: BUSINESS_EMAIL,
    telephone: BUSINESS_PHONE,
    logo: absoluteUrl("/logo.png"),
    sameAs: [
      "https://facebook.com/stephanspetstore",
      "https://instagram.com/stephans_ps",
    ],
  };
}

export function localBusinessJsonLd() {
  const baseStore = {
    "@context": "https://schema.org",
    "@type": "PetStore",
    name: BUSINESS_NAME,
    url: SITE_URL,
    image: absoluteUrl("/og-image.png"),
    email: BUSINESS_EMAIL,
    telephone: BUSINESS_PHONE,
    priceRange: "TZS",
    currenciesAccepted: "TZS",
    paymentAccepted: "Cash, Mobile Money, Card",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "124"
    },
    areaServed: [
      {
        "@type": "City",
        name: "Dar es Salaam",
      },
      {
        "@type": "Country",
        name: "Tanzania",
      },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "10:00",
        closes: "20:30",
      }
    ],
    sameAs: [
      "https://facebook.com/stephanspetstore",
      "https://instagram.com/stephans_ps",
      `https://wa.me/${BUSINESS_WHATSAPP.replace("+", "")}`,
    ],
  };

  return [
    {
      ...baseStore,
      "@id": `${SITE_URL}/#localbusiness-slipway`,
      address: {
        "@type": "PostalAddress",
        streetAddress: "11 Slipway Road",
        addressLocality: "Dar es Salaam",
        addressCountry: "TZ",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "-6.7456",
        longitude: "39.2785"
      }
    },
    {
      ...baseStore,
      "@id": `${SITE_URL}/#localbusiness-mikocheni`,
      address: {
        "@type": "PostalAddress",
        streetAddress: "67M6+93V, Mwai Kibaki Rd, Mikocheni A",
        addressLocality: "Dar es Salaam",
        addressCountry: "TZ",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "-6.7570",
        longitude: "39.2435"
      }
    }
  ];
}

export function faqJsonLd(faqs: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(product: any) {
  const slug = product.slug;
  const url = absoluteUrl(`/shop/${slug}`);
  const image = product.images?.[0]?.asset?.url;
  const sku = product.variants?.find((variant: any) => variant?.sku)?.sku || product._id;
  const brandName = product.brand?.name || BUSINESS_NAME;
  const description = buildProductDescription(product);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description,
    sku,
    image: image ? [image] : undefined,
    brand: {
      "@type": "Brand",
      name: brandName,
    },
    category: product.categories?.map((category: any) => category.title).filter(Boolean).join(" > "),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "TZS",
      price: product.price,
      availability:
        Number(product.stock || 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@id": `${SITE_URL}/#localbusiness`,
      },
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function groomingServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/grooming#service`,
    name: "Pet Grooming Services",
    provider: {
      "@id": `${SITE_URL}/#localbusiness`,
    },
    areaServed: {
      "@type": "City",
      name: "Dar es Salaam",
    },
    description: "Professional grooming services for dogs and cats in Dar es Salaam. We offer bathing, nail clipping, haircuts, and spa treatments. Book online.",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "TZS",
      lowPrice: "15000",
      highPrice: "60000",
      offerCount: "3"
    },
    serviceType: "Pet Grooming"
  };
}
