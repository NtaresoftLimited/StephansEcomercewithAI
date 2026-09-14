const PLACEHOLDER_IMAGE_PATTERN = /(?:placeholder|no[-_ ]?image|dummy|sample)/i;

export function normalizeCatalogProductName(name: unknown): string {
  return String(name ?? "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function hasUsableImage(product: any): boolean {
  // Odoo products have already been restricted to records with image_128.
  if (product?.isOdoo) return true;

  return Array.isArray(product?.images) && product.images.some((image: any) => {
    const asset = image?.asset;
    const value = image?.url || asset?.url || asset?._ref || asset?._id || "";
    return Boolean(value) && !PLACEHOLDER_IMAGE_PATTERN.test(String(value));
  });
}

/**
 * Remove image placeholders and duplicate catalog cards. Input order determines
 * precedence, so callers can put the richer Sanity record before its Odoo copy.
 */
export function cleanCatalogProducts(products: any[]): any[] {
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();

  return products.filter((product) => {
    if (!hasUsableImage(product)) return false;

    const sourceId = String(product?.odooId ?? product?._id ?? product?.id ?? "");
    const odooId = sourceId.replace(/^odoo-/, "");
    const idKeys = [sourceId, odooId && `odoo-${odooId}`].filter(Boolean);
    const normalizedName = normalizeCatalogProductName(product?.name);

    if (idKeys.some((key) => seenIds.has(key))) return false;
    if (normalizedName && seenNames.has(normalizedName)) return false;

    idKeys.forEach((key) => seenIds.add(key));
    if (normalizedName) seenNames.add(normalizedName);
    return true;
  });
}
