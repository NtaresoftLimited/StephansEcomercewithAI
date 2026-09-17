require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2023-05-03',
});

async function checkSanity() {
    const products = await client.fetch("*[_type == 'product' && name in ['Pet Water Fountain', 'Water Fountain Filter']]{name, 'hasImage': defined(images) && length(images) > 0, 'image': images[0].asset->url, 'category': category->slug.current}");
    console.log("Products:");
    products.forEach(p => console.log(`  ${p.name} - Has Image: ${p.hasImage} - Category: ${p.category} - URL: ${p.image}`));
}
checkSanity().catch(console.error);
