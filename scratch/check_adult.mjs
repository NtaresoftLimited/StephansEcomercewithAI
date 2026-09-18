import { createClient } from "@sanity/client";
async function run() {
  const sanity = createClient({ projectId: 'ubqcgegx', dataset: 'production', apiVersion: '2025-12-05', useCdn: false });
  const p = await sanity.fetch(`*[_type == "product" && "adult-dog-food" in categories[]->slug.current] { _id, name, "images": images[0].asset->url }`);
  console.log('Adult Dog Food products in Sanity:', p.length);
  const withoutImage = p.filter(x => !x.images);
  console.log('Without image:', withoutImage.length);
  if (p.length > 0) console.log(p.slice(0, 3));
}
run();
