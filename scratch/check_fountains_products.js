require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2023-05-03',
});

async function checkSanity() {
    const products = await client.fetch("*[_type == 'product' && name match 'fountain']{name, 'category': category->title, 'categorySlug': category->slug.current}");
    console.log("Sanity Fountains:");
    products.forEach(p => console.log(`  ${p.name} (Category: ${p.category} | ${p.categorySlug})`));
}
checkSanity().catch(console.error);
