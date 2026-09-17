const { createClient } = require("@sanity/client");
require("dotenv").config({ path: ".env" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2026-09-15",
  useCdn: false,
});

const normalize = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");

async function run() {
  const [brands, totals] = await Promise.all([
    client.fetch(`*[_type == "brand"] | order(name asc) {
      _id, name, "slug": slug.current, odooId,
      "logo": logo.asset->url,
      "productCount": count(*[_type == "product" && references(^._id)]),
      "productsWithImage": count(*[_type == "product" && references(^._id) && defined(images[0].asset)])
    }`),
    client.fetch(`{
      "products": count(*[_type == "product"]),
      "withBrand": count(*[_type == "product" && defined(brand._ref)]),
      "withImage": count(*[_type == "product" && defined(images[0].asset)]),
      "brokenBrandRefs": count(*[_type == "product" && defined(brand._ref) && !defined(brand->._id)])
    }`),
  ]);

  const groups = new Map();
  for (const brand of brands) {
    const key = normalize(brand.name);
    groups.set(key, [...(groups.get(key) || []), brand]);
  }
  const duplicates = [...groups.values()].filter((rows) => rows.length > 1);
  const websiteBrands = brands.filter((brand) => brand.odooId != null);

  console.log(JSON.stringify({
    counts: {
      ...totals,
      brands: brands.length,
      websiteBrands: websiteBrands.length,
      duplicateBrandGroups: duplicates.length,
      websiteBrandsWithoutLogo: websiteBrands.filter((brand) => !brand.logo).length,
      websiteBrandsWithoutProducts: websiteBrands.filter((brand) => !brand.productCount).length,
    },
    websiteBrands,
    duplicateBrands: duplicates,
    nonWebsiteBrands: brands.filter((brand) => brand.odooId == null),
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
