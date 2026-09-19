import { createClient } from "@sanity/client";

async function run() {
  const sanity = createClient({ 
    projectId: 'ubqcgegx', 
    dataset: 'production', 
    apiVersion: '2025-12-05', 
    useCdn: false 
  });
  
  console.log("Fetching products from Sanity...");
  const products = await sanity.fetch(`*[_type == "product"] { 
    _id, 
    name, 
    price, 
    stock, 
    categories, 
    images,
    odooId
  }`);
  
  console.log(`\n=== SANITY PRODUCT AUDIT ===`);
  console.log(`Total Products: ${products.length}`);
  
  let noImages = 0;
  let noCategories = 0;
  let missingKeysInCategories = 0;
  let missingKeysInImages = 0;
  let draftProducts = 0;
  
  products.forEach(p => {
    if (p._id.startsWith("drafts.")) {
      draftProducts++;
    }
    
    // Check images
    if (!p.images || p.images.length === 0) {
      noImages++;
    } else {
      const hasMissingKey = p.images.some(img => !img._key);
      if (hasMissingKey) missingKeysInImages++;
    }
    
    // Check categories
    if (!p.categories || p.categories.length === 0) {
      noCategories++;
    } else {
      const hasMissingKey = p.categories.some(cat => !cat._key);
      if (hasMissingKey) missingKeysInCategories++;
    }
  });
  
  console.log(`Draft Products: ${draftProducts}`);
  console.log(`Published Products: ${products.length - draftProducts}`);
  console.log(`Products with NO images: ${noImages}`);
  console.log(`Products with NO categories: ${noCategories}`);
  console.log(`Products with missing _key in Categories: ${missingKeysInCategories}`);
  console.log(`Products with missing _key in Images: ${missingKeysInImages}`);
  
}

run().catch(console.error);
