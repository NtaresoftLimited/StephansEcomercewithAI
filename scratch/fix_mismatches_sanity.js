require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03',
});

async function fixMismatches() {
    const products = await client.fetch("*[_type == 'product']{name, _id}");
    const categories = await client.fetch("*[_type == 'category']{title, _id, slug}");
    
    const fixes = [
        { name: 'Cat Round Cooling Mat M', catTarget: 'cats-beds-comfort-mats-pads' },
        { name: 'Cat Round Cooling Mat S', catTarget: 'cats-beds-comfort-mats-pads' },
        { name: 'Cat Round Cooling Mat L', catTarget: 'cats-beds-comfort-mats-pads' },
        { name: 'Furry Cat Head Warmer', catTarget: 'cats-pet-apparel-fashion-accessories' },
        { name: 'Bioline Keep Off Spray For Cats 175ml', catTarget: 'cats-training-behavior-pet-repellents' }
    ];
    
    for (const fix of fixes) {
        const product = products.find(p => p.name === fix.name);
        const category = categories.find(c => c.slug?.current === fix.catTarget || c.title === fix.catTarget);
        
        if (product && category) {
            await client.patch(product._id)
                .set({ category: { _type: 'reference', _ref: category._id } })
                .commit();
            console.log(`Fixed Sanity: ${fix.name} -> ${category.title}`);
        } else {
            console.log(`Could not find product or category for: ${fix.name} -> ${fix.catTarget}`);
        }
    }
}

fixMismatches().catch(console.error);
