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

const updates = JSON.parse(fs.readFileSync('scratch/product_category_updates.json', 'utf8'));

async function syncSanity() {
  console.log("Fetching Sanity data...");
  const categories = await client.fetch(`*[_type == "category"]{ _id, "slug": slug.current }`);
  const catMap = {};
  categories.forEach(c => catMap[c.slug] = c._id);

  const products = await client.fetch(`*[_type == "product"]{ _id, name }`);
  
  // Helper to normalize names for matching
  const normalize = (name) => name ? name.toLowerCase().replace(/\s+/g, ' ').trim() : "";

  const prodMap = {};
  products.forEach(p => {
    prodMap[normalize(p.name)] = p._id;
  });

  console.log(`Found ${products.length} products and ${categories.length} categories in Sanity.`);

  let matchCount = 0;
  let updateCount = 0;
  const transaction = client.transaction();

  for (const update of updates) {
    const normalizedName = normalize(update.name);
    const prodId = prodMap[normalizedName];
    const catId = catMap[update.categorySlug];

    if (prodId && catId) {
      matchCount++;
      // Clean name and update category
      transaction.patch(prodId, {
        set: {
          name: update.name.replace(/\s+/g, ' ').trim(),
          categories: [{
            _key: Math.random().toString(36).substring(2, 9),
            _type: 'reference',
            _ref: catId
          }]
        }
      });
      updateCount++;
      
      // Commit in batches of 100
      if (updateCount % 100 === 0) {
        console.log(`Preparing batch update... (${updateCount} products)`);
      }
    }
  }

  if (updateCount > 0) {
    console.log(`Committing ${updateCount} updates to Sanity...`);
    await transaction.commit();
    console.log("Sanity sync completed!");
  } else {
    console.log("No matches found to update.");
  }
  
  console.log(`Summary: ${matchCount} matches found out of ${updates.length} Excel rows.`);
}

syncSanity().catch(err => console.error("Sync Error:", err));
