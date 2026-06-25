require('dotenv').config({ path: '.env' });
const { createClient } = require('@sanity/client');
const fs = require('fs');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_WRITE_TOKEN,
});

async function exportCategories() {
  const categories = await client.fetch(`*[_type == "category"]{ _id, "slug": slug.current, title }`);
  const mapping = {};
  categories.forEach(cat => {
    mapping[cat.slug] = cat._id;
  });
  fs.writeFileSync('scratch/category_mapping.json', JSON.stringify(mapping, null, 2));
  console.log("Category mapping exported to scratch/category_mapping.json");
}

exportCategories();
