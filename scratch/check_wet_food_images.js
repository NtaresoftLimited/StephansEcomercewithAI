require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2023-05-03',
});

async function checkImages() {
    const productNames = [
        "Summit 10 Pate Delish with Beef 400g",
        "Summit 10 Pate Delish with Chicken 400g",
        "Summit 10 Pate Delish with Duck 400g",
        "Summit 10 Pate Delish with Salmon 400g",
        "Summit 10 Pate Delish with Turkey 400g",
        "Summit 10 Pate Delish with White Fish 400g"
    ];
    const products = await client.fetch("*[_type == 'product' && name in $names]{name, images}", { names: productNames });
    products.forEach(p => {
        const hasImages = p.images && p.images.length > 0;
        console.log(`${p.name}: Has Images? ${hasImages}`);
    });
}
checkImages().catch(console.error);
