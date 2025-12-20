import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function verifyQueries() {
  try {
    const { client } = await import("../sanity/lib/client");
    const { 
      FILTER_PRODUCTS_BY_NAME_QUERY,
      FEATURED_PRODUCTS_QUERY 
    } = await import("../lib/sanity/queries/products");
    const { ALL_CATEGORIES_QUERY } = await import("../lib/sanity/queries/categories");
    const { HERO_PET_IMAGES_QUERY } = await import("../lib/sanity/queries/heroImages");

    console.log("Verifying Queries...");

    console.log("1. Categories...");
    const categories = await client.fetch(ALL_CATEGORIES_QUERY);
    console.log(`   Success! Found ${categories.length} categories.`);

    console.log("2. Featured Products...");
    const featured = await client.fetch(FEATURED_PRODUCTS_QUERY);
    console.log(`   Success! Found ${featured.length} featured products.`);

    console.log("3. Filtered Products (Name)...");
    const products = await client.fetch(FILTER_PRODUCTS_BY_NAME_QUERY, {
      searchQuery: "",
      categorySlug: "",
      color: "",
      material: "",
      minPrice: 0,
      maxPrice: 0,
      inStock: false
    });
    console.log(`   Success! Found ${products.length} products.`);

    console.log("4. Hero Images...");
    const hero = await client.fetch(HERO_PET_IMAGES_QUERY);
    console.log(`   Success! Hero data found.`);

  } catch (error) {
    console.error("Query verification failed:", error);
  }
}

verifyQueries();
