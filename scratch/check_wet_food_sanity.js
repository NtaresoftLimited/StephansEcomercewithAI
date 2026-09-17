require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2023-05-03',
});

async function checkSanity() {
    const categories = await client.fetch("*[_type == 'category']{title, _id, 'slug': slug.current}");
    const wetFoodCats = categories.filter(c => c.title.toLowerCase().includes('wet food') || (c.slug && c.slug.includes('wet-food')));
    console.log("Sanity Categories matching 'Wet Food':");
    wetFoodCats.forEach(c => console.log(`  ${c.title} (${c.slug}) [${c._id}]`));
    
    const productNames = [
        "Summit 10 Pate Delish with Beef 400g",
        "Summit 10 Pate Delish with Chicken 400g",
        "Summit 10 Pate Delish with Duck 400g",
        "Summit 10 Pate Delish with Salmon 400g",
        "Summit 10 Pate Delish with Turkey 400g",
        "Summit 10 Pate Delish with White Fish 400g"
    ];
    
    console.log("\nChecking these products in Sanity...");
    const products = await client.fetch("*[_type == 'product' && name in $names]{name, _id, 'categoryTitle': category->title, 'categorySlug': category->slug.current}", { names: productNames });
    
    products.forEach(p => {
        console.log(`  ${p.name}: ${p.categoryTitle} (${p.categorySlug})`);
    });
}

checkSanity().catch(console.error);
