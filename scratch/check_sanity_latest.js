
require("dotenv").config({ path: ".env" });
const sanityClient = require("@sanity/client");

const client = sanityClient.createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    useCdn: false,
    apiVersion: "2023-05-03",
    token: process.env.SANITY_API_WRITE_TOKEN,
});

async function run() {
    // get products updated today (or recently)
    const recentProducts = await client.fetch(`*[_type == "product"] | order(_updatedAt desc)[0...10] {
        _id,
        name,
        _updatedAt,
        "hasImage": defined(images[0]),
        "hasCategories": defined(categories) || defined(category)
    }`);
    
    console.log("10 Most recently updated products in Sanity:");
    console.log(JSON.stringify(recentProducts, null, 2));
    
    // Check general stats
    const total = await client.fetch(`count(*[_type == "product"])`);
    const withImages = await client.fetch(`count(*[_type == "product" && defined(images[0])])`);
    const withCategories = await client.fetch(`count(*[_type == "product" && (defined(categories) || defined(category))])`);
    
    console.log(`\nTotal products: ${total}`);
    console.log(`Products with images: ${withImages}`);
    console.log(`Products with categories: ${withCategories}`);
}
run();

