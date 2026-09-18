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
  && ($inStock == false || stock > 0)
`;
  const FILTERED_PRODUCT_PROJECTION = `{
    name,
    "categories": categories[]->slug.current
  }`;
  
  const query = `*[${PRODUCT_FILTER_CONDITIONS}] | order(name asc) ${FILTERED_PRODUCT_PROJECTION}`;
  
  const p1 = await sanity.fetch(query, { categorySlug: 'dogs-bowls-feeders-food-bowls', inStock: false });
  console.log('With long slug:', p1.length);
  
  const p2 = await sanity.fetch(query, { categorySlug: 'adult-dog-food', inStock: false });
  console.log('With leaf slug (adult-dog-food):', p2.length);
}
run();
