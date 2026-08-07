require('dotenv').config({ path: '.env' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_WRITE_TOKEN,
});

async function migrate() {
  console.log("Fetching products to migrate...");
  // Fetch products that still have a single `category` field and no `categories` array
  const products = await client.fetch(`*[_type == "product" && defined(category)]{ _id, _rev, category }`);
  
  if (products.length === 0) {
    console.log("No products found needing migration.");
    return;
  }

  console.log(`Found ${products.length} products to migrate.`);
  
  const transaction = client.transaction();
  let count = 0;
  
  for (const p of products) {
    if (p.category && p.category._ref) {
      transaction.patch(p._id, {
        set: {
          categories: [{
            _key: Math.random().toString(36).substring(2, 9),
            _type: 'reference',
            _ref: p.category._ref
          }]
        },
        unset: ['category']
      });
      count++;
    }
  }

  if (count > 0) {
    console.log(`Committing ${count} updates...`);
    await transaction.commit();
    console.log("Migration complete!");
  } else {
    console.log("Nothing to do.");
  }
}

migrate().catch(console.error);
