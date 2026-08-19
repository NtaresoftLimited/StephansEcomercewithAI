import { defineQuery } from "next-sanity";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants/stock";

// ============================================
// Shared Query Fragments (DRY)
// ============================================

/** Common filter conditions for product filtering */
const PRODUCT_FILTER_CONDITIONS = `
  _type == "product"
  && price > 0
  && stock > 0
  && ($categorySlug == "" || 
      $categorySlug in categories[]->slug.current || 
      $categorySlug in categories[]->parentCategory->slug.current || 
      $categorySlug in categories[]->parentCategory->parentCategory->slug.current)
  && ($brandSlug == "" || brand->slug.current == $brandSlug)
  && ($color == "" || color == $color)
  && ($material == "" || material == $material)
  && ($minPrice == 0 || price >= $minPrice)
  && ($maxPrice == 0 || price <= $maxPrice)
  && ($searchQuery == "" || name match $searchQuery + "*" || description match $searchQuery + "*" || brand->name match $searchQuery + "*")
  && ($brandSlug == "" || brand->slug.current == $brandSlug)
  && ($inStock == false || stock > 0)
`;

/** Projection for filtered product lists (includes multiple images for hover) */
const FILTERED_PRODUCT_PROJECTION = `{
  _id,
  name,
  "slug": slug.current,
  price,
  "images": images[0...4]{
    _key,
    asset->{
      _id,
      url
    }
  },
  categories[]->{
    _id,
    title,
    "slug": slug.current
  },
  brand->{
    name,
    "slug": slug.current
  },
  material,
  color,
  stock
}`;

/** Scoring for relevance-based search */
const RELEVANCE_SCORE = `score(
  boost(name match $searchQuery + "*", 3),
  boost(description match $searchQuery + "*", 1)
)`;

// ============================================
// Offers Query Conditions (Featured or Discounted Variant)
// ============================================
const OFFERS_FILTER_CONDITIONS = `
  _type == "product"
  && price > 0
  && stock > 0
  && (
    featured == true
    || count(variants[defined(compareAtPrice) && compareAtPrice > price]) > 0
  )
  && ($categorySlug == "" || 
      $categorySlug in categories[]->slug.current || 
      $categorySlug in categories[]->parentCategory->slug.current || 
      $categorySlug in categories[]->parentCategory->parentCategory->slug.current)
  && ($color == "" || color == $color)
  && ($material == "" || material == $material)
  && ($minPrice == 0 || price >= $minPrice)
  && ($maxPrice == 0 || price <= $maxPrice)
  && ($searchQuery == "" || name match $searchQuery + "*" || description match $searchQuery + "*")
  && ($brandSlug == "" || brand->slug.current == $brandSlug)
  && ($inStock == false || stock > 0)
`;

// ============================================
// All Products Query
// ============================================

/**
 * Get all products with category expanded
 * Used on landing page
 */
export const ALL_PRODUCTS_QUERY = defineQuery(`*[
  _type == "product"
  && price > 0
  && stock > 0
] | order(name asc) {
  _id,
  name,
  "slug": slug.current,
  description,
  price,
  "images": images[]{
    _key,
    asset->{
      _id,
      url
    },
    hotspot
  },
  categories[]->{
    _id,
    title,
    "slug": slug.current
  },
  brand->{
    name,
    "slug": slug.current
  },
  material,
  color,
  dimensions,
  stock,
  featured,
  assemblyRequired
}`);

/**
 * Get featured products for homepage carousel
 */
export const FEATURED_PRODUCTS_QUERY = defineQuery(`*[
  _type == "product"
  && featured == true
  && stock > 0
] | order(name asc) [0...12] {
  _id,
  name,
  "slug": slug.current,
  description,
  price,
  "images": images[]{
    _key,
    asset->{
      _id,
      url
    },
    hotspot
  },
  categories[]->{
    _id,
    title,
    "slug": slug.current
  },
  stock
}`);

/**
 * Get all products with brand info for rotation
 */
export const PRODUCTS_WITH_BRANDS_QUERY = defineQuery(`*[
  _type == "product"
  && defined(brand)
  && price > 0
  && stock > 0
] | order(name asc) {
  _id,
  name,
  "slug": slug.current,
  price,
  "images": images[0...2]{
    _key,
    asset->{
      _id,
      url
    }
  },
  brand->{
    name,
    "slug": slug.current
  },
  categories[]->{
    title
  },
  stock
}`);

/**
 * Get all products by category slug
 */
export const PRODUCTS_BY_CATEGORY_QUERY = defineQuery(`*[
  _type == "product"
  && price > 0
  && stock > 0
  && (
    $categorySlug in categories[]->slug.current || 
    $categorySlug in categories[]->parentCategory->slug.current || 
    $categorySlug in categories[]->parentCategory->parentCategory->slug.current
  )
] | order(name asc) {
  _id,
  name,
  "slug": slug.current,
  "images": images[0...1]{
    _key,
    asset->{
      _id,
      url,
      metadata
    },
    hotspot
  },
  categories[]->{
    _id,
    title,
    "slug": slug.current
  },
  brand->{
    name,
    "slug": slug.current
  },
  material,
  color,
  stock
}`);

/**
 * Get products by brand slug
 */
export const PRODUCTS_BY_BRAND_QUERY = defineQuery(`*[
  _type == "product"
  && price > 0
  && stock > 0
  && brand->slug.current == $brandSlug
] | order(name asc) {
  _id,
  name,
  "slug": slug.current,
  "images": images[0...1]{
    _key,
    asset->{
      _id,
      url,
      metadata
    },
    hotspot
  },
  categories[]->{
    _id,
    title,
    "slug": slug.current
  },
  brand->{
    name,
    "slug": slug.current
  },
  price,
  stock
}`);

/**
 * Get single product by slug
 * Used on product detail page
 */
export const PRODUCT_BY_SLUG_QUERY = defineQuery(`*[
  _type == "product"
  && slug.current == $slug
][0] {
  _id,
  name,
  "slug": slug.current,
  description,
  price,
  "images": images[]{
    _key,
    asset->{
      _id,
      url
    },
    hotspot
  },
  categories[]->{
    _id,
    title,
    "slug": slug.current
  },
  brand->{
    name,
    "slug": slug.current
  },
  material,
  color,
  dimensions,
  stock,
  featured,
  assemblyRequired,
  "variants": variants[]{
    _key,
    name,
    sku,
    price,
    compareAtPrice,
    stock,
    weight,
    odooVariantId
  }
}`);

// ============================================
// Search & Filter Queries (Server-Side)
// Uses GROQ score() for relevance ranking
// ============================================

/**
 * Search products with relevance scoring
 * Uses score() + boost() for better ranking
 * Orders by relevance score descending
 */
export const SEARCH_PRODUCTS_QUERY = defineQuery(`*[
  _type == "product"
  && price > 0
  && stock > 0
  && (
    name match $searchQuery + "*"
    || description match $searchQuery + "*"
    || brand->name match $searchQuery + "*"
  )
] | score(
  boost(name match $searchQuery + "*", 3),
  boost(description match $searchQuery + "*", 1)
) | order(_score desc) {
  _id,
  _score,
  name,
  "slug": slug.current,
  "images": images[0...1]{
    _key,
    asset->{
      _id,
      url,
      metadata
    },
    hotspot
  },
  categories[]->{
    _id,
    title,
    "slug": slug.current
  },
  material,
  color,
  stock
}`);

/**
 * Filter products - ordered by name (A-Z)
 * Returns up to 4 images for hover preview in product cards
 */
export const FILTER_PRODUCTS_BY_NAME_QUERY = defineQuery(
  `*[${PRODUCT_FILTER_CONDITIONS}] | order(defined(brand) desc, name asc) [0...24] ${FILTERED_PRODUCT_PROJECTION}`
);

/**
 * Filter products - ordered by price ascending
 * Returns up to 4 images for hover preview in product cards
 */
export const FILTER_PRODUCTS_BY_PRICE_ASC_QUERY = defineQuery(
  `*[${PRODUCT_FILTER_CONDITIONS}] | order(price asc) [0...24] ${FILTERED_PRODUCT_PROJECTION}`
);

/**
 * Filter products - ordered by price descending
 * Returns up to 4 images for hover preview in product cards
 */
export const FILTER_PRODUCTS_BY_PRICE_DESC_QUERY = defineQuery(
  `*[${PRODUCT_FILTER_CONDITIONS}] | order(price desc) [0...24] ${FILTERED_PRODUCT_PROJECTION}`
);

/**
 * Filter products - ordered by relevance (when searching)
 * Uses score() for search term matching
 * Returns up to 4 images for hover preview in product cards
 */
export const FILTER_PRODUCTS_BY_RELEVANCE_QUERY = defineQuery(
  `*[${PRODUCT_FILTER_CONDITIONS}] | ${RELEVANCE_SCORE} | order(_score desc, name asc) [0...24] ${FILTERED_PRODUCT_PROJECTION}`
);

export const NEW_ARRIVALS_QUERY = defineQuery(
  `*[${PRODUCT_FILTER_CONDITIONS}] | order(_createdAt desc) [0...50] ${FILTERED_PRODUCT_PROJECTION}`
);

// ============================================
// Offers: Featured or Discounted Products
// ============================================
export const OFFERS_BY_NAME_QUERY = defineQuery(
  `*[${OFFERS_FILTER_CONDITIONS}] | order(name asc) ${FILTERED_PRODUCT_PROJECTION}`
);

export const OFFERS_BY_PRICE_ASC_QUERY = defineQuery(
  `*[${OFFERS_FILTER_CONDITIONS}] | order(price asc) ${FILTERED_PRODUCT_PROJECTION}`
);

export const OFFERS_BY_PRICE_DESC_QUERY = defineQuery(
  `*[${OFFERS_FILTER_CONDITIONS}] | order(price desc) ${FILTERED_PRODUCT_PROJECTION}`
);

export const OFFERS_BY_RELEVANCE_QUERY = defineQuery(
  `*[${OFFERS_FILTER_CONDITIONS}] | ${RELEVANCE_SCORE} | order(_score desc, name asc) ${FILTERED_PRODUCT_PROJECTION}`
);

/**
 * Get products by IDs (for cart/checkout)
 */
export const PRODUCTS_BY_IDS_QUERY = defineQuery(`*[
  _type == "product"
  && _id in $ids
] {
  _id,
  name,
  "slug": slug.current,
  "images": images[0...1]{
    _key,
    asset->{
      _id,
      url,
      metadata
    }
  },
  "image": images[0]{
    asset->{
      url
    }
  },
  price,
  stock
}`);

/**
 * Get low stock products (admin)
 * Uses LOW_STOCK_THRESHOLD constant for consistency
 */
export const LOW_STOCK_PRODUCTS_QUERY = defineQuery(`*[
  _type == "product"
  && stock > 0
  && stock <= ${LOW_STOCK_THRESHOLD}
] | order(stock asc) {
  _id,
  name,
  "slug": slug.current,
  stock,
  "images": images[0...1]{
    _key,
    asset->{
      _id,
      url,
      metadata
    }
  }
}`);

/**
 * Get out of stock products (admin)
 */
export const OUT_OF_STOCK_PRODUCTS_QUERY = defineQuery(`*[
  _type == "product"
  && stock == 0
] | order(name asc) {
  _id,
  name,
  "slug": slug.current,
  "images": images[0...1]{
    _key,
    asset->{
      _id,
      url,
      metadata
    }
  }
}`);

// ============================================
// AI Shopping Assistant Query
// Uses score() + boost() with all filters for AI agent
// ============================================

/**
 * Search products for AI shopping assistant
 * Full-featured search with all filters and product details
 */
export const AI_SEARCH_PRODUCTS_QUERY = defineQuery(`*[
  _type == "product"
  && price > 0
  && stock > 0
  && (
    $searchQuery == ""
    || name match $searchQuery + "*"
    || description match $searchQuery + "*"
    || categories[]->title match $searchQuery + "*"
  )
  && ($categorySlug == "" || 
      $categorySlug in categories[]->slug.current || 
      $categorySlug in categories[]->parentCategory->slug.current || 
      $categorySlug in categories[]->parentCategory->parentCategory->slug.current)
  && ($material == "" || material == $material)
  && ($color == "" || color == $color)
  && ($minPrice == 0 || price >= $minPrice)
  && ($maxPrice == 0 || price <= $maxPrice)
] | order(name asc) [0...20] {
  _id,
  name,
  "slug": slug.current,
  description,
  "images": images[0...1]{
    _key,
    asset->{
      _id,
      url,
      metadata
    }
  },
  categories[]->{
    _id,
    title,
    "slug": slug.current
  },
  material,
  color,
  dimensions,
  price,
  stock,
  featured,
  assemblyRequired,
  "image": images[0]{
    asset->{
      _id,
      url
    }
  }
}`);
