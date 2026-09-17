import { cleanCatalogProducts, normalizeCatalogProductName } from '../lib/catalog/clean-products';
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({path: '../.env'});

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2023-05-03',
});

client.fetch("*[_type == 'product']{name, _id, _createdAt, images}").then(products => {
    const cleaned = cleanCatalogProducts(products);
    console.log(`Original: ${products.length}, Cleaned: ${cleaned.length}`);
    
    // Check if any duplicates are left in cleaned
    const names = cleaned.map(p => normalizeCatalogProductName(p.name));
    const duplicates = names.filter((item, index) => names.indexOf(item) !== index);
    console.log("Duplicates left after cleaning:", duplicates.length);
}).catch(console.error);
