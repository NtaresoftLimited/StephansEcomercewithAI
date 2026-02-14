import { groq } from "next-sanity";

export const ALL_BRANDS_QUERY = groq`
  *[_type == "brand"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    "logo": logo.asset->url,
    description
  }
`;

export const BRAND_BY_SLUG_QUERY = groq`
  *[_type == "brand" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    "logo": logo.asset->url,
    description
  }
`;
