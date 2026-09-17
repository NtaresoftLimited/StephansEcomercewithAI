require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2023-05-03',
});

async function checkSanity() {
    const p = await client.fetch("*[_type == 'product' && name == 'Pet Water Fountain'][0]{name, images, stock}");
    console.log(JSON.stringify(p, null, 2));
}
checkSanity().catch(console.error);
