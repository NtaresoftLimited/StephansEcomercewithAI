import { createClient } from "@sanity/client";

const sanity = createClient({
  projectId: "ubqcgegx",
  dataset: "production",
  apiVersion: "2025-12-05",
  useCdn: false,
});

async function main() {
  const sanityDocs = await sanity.fetch(`*[_type == "product" && name match "Litter Box" || name match "Scratcher"] { _id, name, "hasImage": defined(images[0].asset), "imageUrl": images[0].asset->url }`);
  
  console.log("=== LATEST 10 SANITY PRODUCTS ===");
  for (const p of sanityDocs) { 
      console.log(`[${p._id}] ${p.name} | hasImage: ${p.hasImage} | URL: ${p.imageUrl || 'NONE'}`); 
  }
}

main().catch(console.error);
