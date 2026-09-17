require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03',
});

async function fixKeepOff() {
    const products = await client.fetch("*[_type == 'product']{name, _id}");
    const categories = await client.fetch("*[_type == 'category']{title, _id, slug}");
    
    const product = products.find(p => p.name === 'Bioline Keep Off Spray For Cats 175ml');
    const category = categories.find(c => c.slug?.current === 'cats-grooming-essentials-pet-perfumes-sprays');
    
    if (product && category) {
        await client.patch(product._id)
            .set({ category: { _type: 'reference', _ref: category._id } })
            .commit();
        console.log(`Fixed Sanity: ${product.name} -> ${category.title}`);
    }
}

fixKeepOff().catch(console.error);
