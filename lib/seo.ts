export const SITE_URL = "https://www.stephanspetstore.co.tz";
export const SITE_NAME = "Stephan's Pet Store";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function truncateDescription(value?: string | null) {
  const fallback =
    "Premium pet supplies, food, accessories, and grooming services in Dar es Salaam, Tanzania.";
  const description = value?.replace(/\s+/g, " ").trim() || fallback;

  return description.length > 160
    ? `${description.slice(0, 157).trimEnd()}...`
    : description;
}

export function buildProductDescription(product: {
  name?: string | null;
  description?: string | null;
  brand?: { name?: string | null } | null;
  categories?: Array<{ title?: string | null }> | null;
  price?: number | null;
}) {
  const rawDescription = product.description?.replace(/\s+/g, " ").trim();
  const productName = product.name?.trim() || "Pet product";

  if (rawDescription && rawDescription.toLowerCase() !== productName.toLowerCase()) {
    return truncateDescription(rawDescription);
  }

  const brand = product.brand?.name ? `${product.brand.name} ` : "";
  const category = product.categories?.[0]?.title
    ? ` for ${product.categories[0].title.toLowerCase()}`
    : "";
  const price = product.price
    ? ` Available from TZS ${product.price.toLocaleString("en-US")}.`
    : "";

  return truncateDescription(
    `Buy ${brand}${productName}${category} at ${SITE_NAME} in Dar es Salaam, Tanzania. Premium pet supplies with local support and delivery.${price}`,
  );
}
