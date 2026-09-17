require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2023-05-03',
});

client.fetch("*[_type == 'product']{name, _id, _createdAt}").then(products => {
    console.log(`Total Sanity products: ${products.length}`);
    const names = products.map(p => p.name.trim());
    const duplicates = names.filter((item, index) => names.indexOf(item) !== index);
    if (duplicates.length > 0) {
        console.log("Duplicate product names in Sanity:");
        console.log([...new Set(duplicates)]);
    } else {
        console.log("No duplicate product names in Sanity.");
    }
}).catch(console.error);
