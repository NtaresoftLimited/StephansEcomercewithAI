require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2023-05-03',
});

async function checkSanity() {
    const products = await client.fetch("*[_type == 'product' && name in ['Pet Water Fountain', 'Water Fountain Filter']]{name, price, stock, 'categories': categories[]->slug.current}");
    console.log("Products:");
    products.forEach(p => console.log(`  ${p.name} - Price: ${p.price} - Stock: ${p.stock} - Cats: ${JSON.stringify(p.categories)}`));
}
checkSanity().catch(console.error);
