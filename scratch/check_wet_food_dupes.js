require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2023-05-03',
});

async function checkSanityDupes() {
    const productNames = [
        "Summit 10 Pate Delish with Beef 400g",
        "Summit 10 Pate Delish with Chicken 400g",
        "Summit 10 Pate Delish with Duck 400g",
        "Summit 10 Pate Delish with Salmon 400g",
        "Summit 10 Pate Delish with Turkey 400g",
        "Summit 10 Pate Delish with White Fish 400g"
    ];
    
    const products = await client.fetch("*[_type == 'product' && name in $names]{name, _id}", { names: productNames });
    
    console.log(`Found ${products.length} products for 6 names.`);
    products.forEach(p => {
        console.log(`  ${p.name} [${p._id}]`);
    });
}

checkSanityDupes().catch(console.error);
