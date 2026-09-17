require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: true,
  apiVersion: '2023-05-03',
});

const PRODUCT_FILTER_CONDITIONS = `
    _type == "product"
    && price > 0
    && stock > 0
    && ($categorySlug == "" || 
        $categorySlug in categories[]->slug.current || 
        $categorySlug in categories[]->parentCategory->slug.current || 
        $categorySlug in categories[]->parentCategory->parentCategory->slug.current)
`;

async function test() {
    const query = `*[${PRODUCT_FILTER_CONDITIONS}] { name, price, stock }`;
    const res = await client.fetch(query, { categorySlug: "dogs-bowls-feeders-water-fountains" });
    console.log("Found:", res.length);
    console.log(res);
}
test().catch(console.error);
