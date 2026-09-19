import { createClient } from "@sanity/client";
async function run() {
  const sanity = createClient({ projectId: 'ubqcgegx', dataset: 'production', apiVersion: '2025-12-05', useCdn: false });
  const PRODUCT_FILTER_CONDITIONS = `
  _type == 'product'
  && price > 0
  && ($categorySlug == '' || 
      $categorySlug in categories[]->slug.current || 
      $categorySlug in categories[]->parentCategory->slug.current || 
      $categorySlug in categories[]->parentCategory->parentCategory->slug.current ||
      $categoryLeafSlug in categories[]->slug.current || 
      $categoryLeafSlug in categories[]->parentCategory->slug.current || 
      $categoryLeafSlug in categories[]->parentCategory->parentCategory->slug.current)
  && ($brandSlug == '' || brand->slug.current == $brandSlug)
  && ($color == '' || $color in colors)
  && ($material == '' || $material in materials)
  && ($minPrice == 0 || price >= $minPrice)
  && ($maxPrice == 0 || price <= $maxPrice)
  && ($searchQuery == '' || name match $searchQuery + "*" || description match $searchQuery + "*" || pt::text(portableDescription) match $searchQuery + "*")
  && ($inStock == false || stock > 0)
`;
  const p = await sanity.fetch(`*[${PRODUCT_FILTER_CONDITIONS}]`, {
    categorySlug: "",
    categoryLeafSlug: "",
    brandSlug: "",
    color: "",
    material: "",
    minPrice: 0,
    maxPrice: 0,
    searchQuery: "",
    inStock: false
  });
  console.log(`Total products matched: ${p.length}`);
}
run();
