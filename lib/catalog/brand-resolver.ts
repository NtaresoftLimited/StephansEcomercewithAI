export interface ResolvedBrand {
  name: string;
  slug: string;
  logo: string;
}

const KNOWN_BRANDS: Array<{
  pattern: RegExp;
  name: string;
  slug: string;
  logo: string;
}> = [
  {
    pattern: /\bsummit\s*10\b/i,
    name: "Summit 10",
    slug: "summit10",
    logo: "/brands/Summit-10.svg",
  },
  {
    pattern: /\bbioline\b/i,
    name: "Bioline",
    slug: "bioline",
    logo: "/brands/Bioline.webp",
  },
  {
    pattern: /\btropidog\b/i,
    name: "TropiDog",
    slug: "tropidog",
    logo: "/brands/TropiDog_logo.svg",
  },
  {
    pattern: /\btropicat\b/i,
    name: "TropiCat",
    slug: "tropicat",
    logo: "/brands/TropiCat_logo.svg",
  },
];

/**
 * Resolves a product's authentic brand and logo image.
 * Never falls back to "Stephan's" or placeholder text.
 * Returns null if the product has no authentic brand with a logo image.
 */
export function resolveProductBrand(product: any): ResolvedBrand | null {
  if (!product) return null;

  const rawBrandName = typeof product.brand?.name === "string" ? product.brand.name.trim() : "";
  const rawBrandSlug =
    typeof product.brand?.slug === "string"
      ? product.brand.slug.trim()
      : typeof product.brand?.slug?.current === "string"
        ? product.brand.slug.current.trim()
        : "";
  const rawBrandLogo =
    typeof product.brand?.logo === "string"
      ? product.brand.logo.trim()
      : typeof product.brand?.logo?.asset?.url === "string"
        ? product.brand.logo.asset.url.trim()
        : "";

  // Ignore any accidental "Stephan's" brand assignment
  const isStephans = /stephan/i.test(rawBrandName) || /stephan/i.test(rawBrandSlug);

  if (!isStephans && rawBrandName) {
    // Check if the brand matches one of our known local brand logos if logo is missing
    const matchedKnown = KNOWN_BRANDS.find(
      (b) => b.pattern.test(rawBrandName) || b.slug.toLowerCase() === rawBrandSlug.toLowerCase()
    );
    const logoUrl = rawBrandLogo || matchedKnown?.logo || "";
    if (logoUrl) {
      return {
        name: matchedKnown?.name || rawBrandName,
        slug: rawBrandSlug || matchedKnown?.slug || "",
        logo: logoUrl,
      };
    }
  }

  // Fallback: check if the product name itself starts with / contains an official brand
  const productName = typeof product.name === "string" ? product.name : "";
  const matchedFromName = KNOWN_BRANDS.find((b) => b.pattern.test(productName));
  if (matchedFromName) {
    return {
      name: matchedFromName.name,
      slug: matchedFromName.slug,
      logo: matchedFromName.logo,
    };
  }

  return null;
}
