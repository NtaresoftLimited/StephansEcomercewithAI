require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03',
});

async function auditAndClean() {
    const products = await client.fetch("*[_type == 'product']{name, _id, _createdAt, 'categorySlug': category->slug.current}");
    
    const nameMap = new Map();
    const toDelete = [];
    
    for (const p of products) {
        if (!p.name) continue;
        const normName = p.name.trim().toLowerCase();
        
        if (nameMap.has(normName)) {
            // It's a duplicate
            const existing = nameMap.get(normName);
            // keep the older one
            if (new Date(p._createdAt) < new Date(existing._createdAt)) {
                toDelete.push(existing._id);
                nameMap.set(normName, p);
            } else {
                toDelete.push(p._id);
            }
        } else {
            nameMap.set(normName, p);
        }
    }
    
    console.log(`Found ${toDelete.length} duplicate products in Sanity.`);
    for (const id of toDelete) {
        const prod = products.find(x => x._id === id);
        console.log(`Deleting duplicate: ${prod.name} (ID: ${id})`);
        await client.delete(id);
    }
    console.log("Finished deleting duplicates in Sanity.");
}

auditAndClean().catch(console.error);
