import type { MetadataRoute } from "next";
import { groq } from "next-sanity";
import { client } from "@/sanity/lib/client";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

type SitemapEntry = {
  slug?: string | null;
  _updatedAt?: string | null;
};

const PRODUCT_SITEMAP_QUERY = groq`
  *[_type == "product" && defined(slug.current)] {
    "slug": slug.current,
    _updatedAt
  }
`;

const BRAND_SITEMAP_QUERY = groq`
  *[_type == "brand" && defined(slug.current)] {
    "slug": slug.current,
    _updatedAt
  }
`;

function toSitemapUrl(
  path: string,
  lastModified?: string | null,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly",
  priority = 0.7,
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(path),
    lastModified: lastModified ? new Date(lastModified) : new Date(),
    changeFrequency,
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    toSitemapUrl("/", null, "daily", 1),
    toSitemapUrl("/products", null, "daily", 0.9),
    toSitemapUrl("/products/offers", null, "daily", 0.8),
    toSitemapUrl("/grooming", null, "monthly", 0.8),
    toSitemapUrl("/about", null, "monthly", 0.6),
    toSitemapUrl("/contact", null, "monthly", 0.6),
    toSitemapUrl("/stores", null, "monthly", 0.6),
    toSitemapUrl("/return-policy", null, "yearly", 0.4),
    toSitemapUrl("/terms", null, "yearly", 0.4),
  ];

  const [products, brands] = await Promise.all([
    client.fetch<SitemapEntry[]>(PRODUCT_SITEMAP_QUERY),
    client.fetch<SitemapEntry[]>(BRAND_SITEMAP_QUERY),
  ]);

  const productRoutes = products
    .filter((product) => product.slug)
    .map((product) =>
      toSitemapUrl(
        `/products/${product.slug}`,
        product._updatedAt,
        "weekly",
        0.8,
      ),
    );

  const brandRoutes = brands
    .filter((brand) => brand.slug)
    .map((brand) =>
      toSitemapUrl(`/brands/${brand.slug}`, brand._updatedAt, "weekly", 0.7),
    );

  return [...staticRoutes, ...productRoutes, ...brandRoutes];
}
