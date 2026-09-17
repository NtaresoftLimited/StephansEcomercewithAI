require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2023-05-03',
});

async function checkSanity() {
    const cats = await client.fetch("*[_type == 'category' && title match 'Water Fountains']{title, 'slug': slug.current, 'parent': parentCategory->title}");
    console.log("Sanity Categories:");
    cats.forEach(c => console.log(`  ${c.title} (Slug: ${c.slug}, Parent: ${c.parent})`));
}
checkSanity().catch(console.error);
