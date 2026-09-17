
const sanityClient = require("@sanity/client");
require("dotenv").config({ path: ".env" });

const client = sanityClient.createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    useCdn: false,
    apiVersion: "2023-05-03",
    token: process.env.SANITY_API_WRITE_TOKEN,
});

async function main() {
    // Update the slug of category-odoo-1215 to "food-water-dispensers"
    await client.patch("category-odoo-1215").set({ slug: { _type: "slug", current: "food-water-dispensers" } }).commit();
    console.log("✅ Updated slug to food-water-dispensers");
    
    // Verify
    const cat = await client.fetch(`*[_type == "category" && _id == "category-odoo-1215"]{ _id, title, slug }`);
    console.log("Category:", JSON.stringify(cat, null, 2));
}
main().catch(console.error);

