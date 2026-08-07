require('dotenv').config({ path: '.env' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_WRITE_TOKEN,
});

async function check() {
  const products = await client.fetch(`*[_type == "product"]{ _id, category, categories }[0...5]`);
  console.log("Total products sampled:", products.length);
  console.log(JSON.stringify(products, null, 2));
}

check().catch(console.error);
