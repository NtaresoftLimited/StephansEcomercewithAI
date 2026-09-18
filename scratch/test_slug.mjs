import { createClient } from "@sanity/client";
async function run() {
  const sanity = createClient({ projectId: 'ubqcgegx', dataset: 'production', apiVersion: '2025-12-05', useCdn: false });
  const PRODUCT_FILTER_CONDITIONS = `
  _type == 'product'
  && price > 0
  && ($categorySlug == '' || 
      $categorySlug in categories[]->slug.current || 
      $categorySlug in categories[]->parentCategory->slug.current || 
      $categorySlug in categories[]->parentCategory->parentCategory->slug.current)
`;
  const FILTERED_PRODUCT_PROJECTION = `{
    name,
    "categories": categories[]->slug.current
  }`;
  
  const query = `*[${PRODUCT_FILTER_CONDITIONS}] | order(name asc) ${FILTERED_PRODUCT_PROJECTION}`;
  
  const p1 = await sanity.fetch(query, { categorySlug: 'dogs-bowls-feeders-food-bowls' });
  console.log('With long slug:', p1.length);
  
  const p2 = await sanity.fetch(query, { categorySlug: 'food-bowls' });
  console.log('With leaf slug (food-bowls):', p2.length);
}
run();
