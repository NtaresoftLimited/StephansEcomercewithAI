require('dotenv').config({ path: '.env' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_WRITE_TOKEN,
});

async function checkProducts() {
  const products = await client.fetch(`*[_type == "product"]{ _id, name, "category": category->title } | order(name asc)[0...10]`);
  console.log("Current Sanity Products (First 10):", JSON.stringify(products, null, 2));
  
  const count = await client.fetch(`count(*[_type == "product"])`);
  console.log("Total Products in Sanity:", count);
}

checkProducts();
