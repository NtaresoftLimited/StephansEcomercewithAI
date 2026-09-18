import { createClient } from "@sanity/client";
async function run() {
  const sanity = createClient({ projectId: 'ubqcgegx', dataset: 'production', apiVersion: '2025-12-05', useCdn: false });
  const p1 = await sanity.fetch(`*[_type == "product" && "dogs-bowls-feeders-food-bowls" in categories[]->slug.current] { _id }`);
  const p2 = await sanity.fetch(`*[_type == "product" && "food-bowls" in categories[]->slug.current] { _id }`);
  console.log('dogs-bowls-feeders-food-bowls:', p1.length);
  console.log('food-bowls:', p2.length);
}
run();
