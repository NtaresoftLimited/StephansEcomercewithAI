require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03',
});

async function findCat() {
    const categories = await client.fetch("*[_type == 'category']{title, _id, slug}");
    const catsCat = categories.filter(c => c.slug?.current?.startsWith('cat'));
    console.log(catsCat.map(c => c.slug?.current));
}

findCat().catch(console.error);
