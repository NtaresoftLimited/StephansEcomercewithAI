
const { createClient } = require("@sanity/client");

const projectId = "ubqcgegx"; // Corrected from .env
const dataset = "production";
const apiVersion = "2024-02-05";

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

const PRODUCT_FILTER_CONDITIONS = `
  _type == "product"
  && ($categorySlug == "" || category->slug.current == $categorySlug)
  && ($color == "" || color == $color)
  && ($material == "" || material == $material)
  && ($minPrice == 0 || price >= $minPrice)
  && ($maxPrice == 0 || price <= $maxPrice)
  && ($searchQuery == "" || name match $searchQuery + "*" || description match $searchQuery + "*")
  && ($inStock == false || stock > 0)
`;

// Removed brand->name match from boost()
const RELEVANCE_SCORE = `score(
  boost(name match $searchQuery + "*", 3),
  boost(description match $searchQuery + "*", 1)
)`;

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
  category->{
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

const FILTER_PRODUCTS_BY_RELEVANCE_QUERY = `*[${PRODUCT_FILTER_CONDITIONS}] | ${RELEVANCE_SCORE} | order(_score desc, name asc) ${FILTERED_PRODUCT_PROJECTION}`;

const queryParams = {
  searchQuery: "Beeno",
  categorySlug: "",
  minPrice: 0,
  maxPrice: 0,
  inStock: false,
  color: "",
  material: "",
};

async function run() {
  console.log("Running query:", FILTER_PRODUCTS_BY_RELEVANCE_QUERY);
  try {
    const result = await client.fetch(FILTER_PRODUCTS_BY_RELEVANCE_QUERY, queryParams);
    console.log("Success! Found " + result.length + " products");
  } catch (err) {
    console.error("Query failed:", err);
    if (err.details) console.error("Details:", JSON.stringify(err.details, null, 2));
  }
}

run();
