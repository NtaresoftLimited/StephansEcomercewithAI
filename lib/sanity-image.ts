/**
 * Append Sanity CDN transformation params so browsers download a resized,
 * compressed (auto WebP/AVIF) image instead of the full-resolution original.
 * Non-Sanity URLs (e.g. Odoo, Unsplash) are returned unchanged.
 */
export function sanityImageUrl(
  url: string | null | undefined,
  width = 600,
  quality = 75,
): string | undefined {
  if (!url) return undefined;
  if (!url.includes("cdn.sanity.io/images/")) return url;
  if (url.includes("?")) return url;
  return `${url}?w=${width}&fit=max&auto=format&q=${quality}`;
}
