require('dotenv').config({ path: '.env' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_WRITE_TOKEN,
});

async function checkSanityImages() {
  const products = await client.fetch(`*[_type == "product" && defined(images[0])]{ _id, name, "imageUrl": images[0].asset->url } | order(name asc)[0...5]`);
  console.log("Sanity Products with Images:", JSON.stringify(products, null, 2));
}

checkSanityImages();
