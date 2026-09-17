require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03',
});

async function cleanCategories() {
    const cats = await client.fetch("*[_type == 'category']{title, _id, _createdAt, 'slug': slug.current}");
    
    const slugMap = new Map();
    const toDelete = [];
    
    for (const c of cats) {
        if (!c.slug) continue;
        const normSlug = c.slug.trim().toLowerCase();
        
        if (slugMap.has(normSlug)) {
            const existing = slugMap.get(normSlug);
            if (new Date(c._createdAt) < new Date(existing._createdAt)) {
                toDelete.push(existing._id);
                slugMap.set(normSlug, c);
            } else {
                toDelete.push(c._id);
            }
        } else {
            slugMap.set(normSlug, c);
        }
    }
    
    console.log(`Found ${toDelete.length} duplicate categories in Sanity.`);
    for (const id of toDelete) {
        const cat = cats.find(x => x._id === id);
        console.log(`Deleting duplicate category: ${cat.title} (${cat.slug}) (ID: ${id})`);
        // Note: I will just print them first before deleting them, because deleting categories could break product references.
    }
}

cleanCategories().catch(console.error);
