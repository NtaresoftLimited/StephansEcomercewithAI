import { defineQuery } from "next-sanity";

// Fetch hero images by section
export const HERO_IMAGES_BY_SECTION_QUERY = defineQuery(`
  *[_type == "heroImage" && section == $section] | order(order asc) {
    _id,
    title,
    section,
    "imageUrl": image.asset->url,
    order
  }
`);

// Fetch all hero images for home section
export const HERO_HOME_IMAGES_QUERY = defineQuery(`
  *[_type == "heroImage" && section == "hero-home"] | order(order asc) {
    _id,
    title,
    "imageUrl": image.asset->url
  }
`);

// Fetch all pet category hero images
export const HERO_PET_IMAGES_QUERY = defineQuery(`
  {
    "dogImages": *[_type == "heroImage" && section == "hero-dog"] | order(order asc) { "url": image.asset->url },
    "catImages": *[_type == "heroImage" && section == "hero-cat"] | order(order asc) { "url": image.asset->url },
    "birdImages": *[_type == "heroImage" && section == "hero-bird"] | order(order asc) { "url": image.asset->url },
    "fishImages": *[_type == "heroImage" && section == "hero-fish"] | order(order asc) { "url": image.asset->url }
  }
`);
