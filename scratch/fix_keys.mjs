import { createClient } from "@sanity/client";
import { v4 as uuidv4 } from "uuid";

async function run() {
  const sanity = createClient({ 
    projectId: 'ubqcgegx', 
    dataset: 'production', 
    apiVersion: '2025-12-05', 
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN 
  });
  
  console.log("Fetching products with missing keys...");
  const products = await sanity.fetch(`*[_type == "product" && defined(categories)] { 
    _id, 
    categories 
  }`);
  
  let patchCount = 0;
  
  for (const p of products) {
    if (!p.categories || !Array.isArray(p.categories)) continue;
    
    let needsUpdate = false;
    const newCategories = p.categories.map(cat => {
      if (!cat._key) {
        needsUpdate = true;
        return { ...cat, _key: uuidv4() };
      }
      return cat;
    });
    
    if (needsUpdate) {
      console.log(`Patching keys for product ${p._id}...`);
      await sanity.patch(p._id).set({ categories: newCategories }).commit();
      patchCount++;
    }
  }
  
  console.log(`\nFixed missing keys on ${patchCount} products!`);
}

run().catch(console.error);
