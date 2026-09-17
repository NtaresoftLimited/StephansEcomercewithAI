require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2023-05-03',
});

async function checkSanity() {
    const cats = await client.fetch("*[_type == 'category' && slug.current match 'water-fountains']{title, 'slug': slug.current, 'parentSlug': parentCategory->slug.current}");
    console.log("Sanity Categories:");
    cats.forEach(c => console.log(`  ${c.title} (Slug: ${c.slug}, Parent Slug: ${c.parentSlug})`));
}
checkSanity().catch(console.error);
