import { defineQuery } from "next-sanity";

/**
 * Get all categories
 * Used for navigation and filters
 */
export const ALL_CATEGORIES_QUERY = defineQuery(`*[
  _type == "category"
] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  "parentCategory": parentCategory->{
    "slug": slug.current,
    title
  },
  "image": image{
    asset->{
      _id,
      url
    },
    hotspot
  },
  "productCount": count(*[_type == "product" && (category._ref == ^._id || category->parentCategory._ref == ^._id || category->parentCategory->parentCategory._ref == ^._id)])
}`);

/**
 * Get category by slug
 */
export const CATEGORY_BY_SLUG_QUERY = defineQuery(`*[
  _type == "category"
  && slug.current == $slug
][0] {
  _id,
  title,
  "slug": slug.current,
  "image": image{
    asset->{
      _id,
      url
    },
    hotspot
  }
}`);
