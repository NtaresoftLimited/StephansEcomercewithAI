import { createClient } from "@sanity/client";

async function run() {
  const sanity = createClient({ 
    projectId: "ubqcgegx", 
    dataset: "production", 
    apiVersion: "2025-12-05", 
    useCdn: false 
  });
  
  const products = await sanity.fetch(`*[_type == "product" && !defined(images[0].asset)] { name } | order(name asc)`);
  console.log('Products without images:', products.length);
  products.forEach(p => console.log('- ' + p.name));
}

run();
