require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03',
});

async function fixFountainsBoth() {
    const categories = await client.fetch("*[_type == 'category']{title, _id, 'slug': slug.current}");
    const catFountainCat = categories.find(c => c.slug === 'cats-bowls-feeders-water-fountains');
    const dogFountainCat = categories.find(c => c.slug === 'dogs-bowls-feeders-water-fountains');
    
    const sharedFountains = [
        "Transparent water fountain",
        "Ceramic water fountain",
        "waterfall pet water fountain With light",
        "waterfall pet water fountain With no light"
    ];
    
    const products = await client.fetch("*[_type == 'product' && name match 'fountain']{name, _id, categories}");
    
    for (const p of products) {
        if (sharedFountains.includes(p.name)) {
            await client.patch(p._id)
                .setIfMissing({ categories: [] })
                .set({
                    categories: [
                        { _type: 'reference', _key: Math.random().toString(36).substring(7), _ref: catFountainCat._id },
                        { _type: 'reference', _key: Math.random().toString(36).substring(7), _ref: dogFountainCat._id }
                    ]
                })
                .commit();
            console.log(`Shared ${p.name} -> Both Cats & Dogs`);
        }
    }
}
fixFountainsBoth().catch(console.error);
