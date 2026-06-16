export const SITE_URL = "https://www.stephanspetstore.co.tz";

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
