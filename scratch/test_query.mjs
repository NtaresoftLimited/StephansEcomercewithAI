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
  && ($brandSlug == '' || brand->slug.current == $brandSlug)
  && ($color == '' || color == $color)
  && ($material == '' || material == $material)
  && ($minPrice == 0 || price >= $minPrice)
  && ($maxPrice == 0 || price <= $maxPrice)
  && ($searchQuery == '' || name match $searchQuery + '*' || description match $searchQuery + '*' || brand->name match $searchQuery + '*')
  && ($brandSlug == '' || brand->slug.current == $brandSlug)
  && ($inStock == false || stock > 0)
`;
  const FILTERED_PRODUCT_PROJECTION = `{
    _id,
    name,
    stock,
    "images": images[0...4]{
      _key,
      asset->{
        _id,
        url
      }
    }
  }`;
  
  const query = `*[${PRODUCT_FILTER_CONDITIONS}] | order(name asc) ${FILTERED_PRODUCT_PROJECTION}`;
  
  const params = {
      searchQuery: '',
      categorySlug: '',
      brandSlug: '',
      color: '',
      material: '',
      minPrice: 0,
      maxPrice: 0,
      inStock: false
  };
  
  const products = await sanity.fetch(query, params);
  console.log('Fetched:', products.length);
  const withoutUsable = products.filter(product => {
    return !(Array.isArray(product.images) && product.images.some(image => {
      const asset = image?.asset;
      const value = image?.url || asset?.url || asset?._ref || asset?._id || '';
      return Boolean(value) && !/(?:placeholder|no[-_ ]?image|dummy|sample)/i.test(String(value));
    }));
  });
  console.log('Without usable image:', withoutUsable.length);
  if (withoutUsable.length > 0) console.log(withoutUsable.slice(0, 3));
}
run();
