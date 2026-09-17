require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03',
});

async function fixFountainsAgain() {
    const categories = await client.fetch("*[_type == 'category']{title, _id, 'slug': slug.current}");
    
    const catFountainCat = categories.find(c => c.slug === 'cats-bowls-feeders-water-fountains');
    const dogFountainCat = categories.find(c => c.slug === 'dogs-bowls-feeders-water-fountains');
    
    const catFountains = [
        "Transparent water fountain",
        "Ceramic water fountain",
        "waterfall pet water fountain With light",
        "waterfall pet water fountain With no light",
        "Cat Water Fountain With Bowl"
    ];
    
    const dogFountains = [
        "Pet Water Fountain",
        "Water Fountain Filter"
    ];
    
    const products = await client.fetch("*[_type == 'product' && name match 'fountain']{name, _id}");
    
    for (const p of products) {
        if (catFountains.includes(p.name)) {
            await client.patch(p._id)
                .set({ categories: [{ _type: 'reference', _key: Math.random().toString(36).substring(7), _ref: catFountainCat._id }] })
                .unset(['category']) // clean up my mistake
                .commit();
            console.log(`Moved ${p.name} -> Cats (categories array)`);
        } else if (dogFountains.includes(p.name)) {
            await client.patch(p._id)
                .set({ categories: [{ _type: 'reference', _key: Math.random().toString(36).substring(7), _ref: dogFountainCat._id }] })
                .unset(['category'])
                .commit();
            console.log(`Moved ${p.name} -> Dogs (categories array)`);
        }
    }
}
fixFountainsAgain().catch(console.error);
