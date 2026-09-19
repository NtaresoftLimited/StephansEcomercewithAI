import { createClient } from "@sanity/client";
async function run() {
  const sanity = createClient({ projectId: 'ubqcgegx', dataset: 'production', apiVersion: '2025-12-05', useCdn: false });
  const p = await sanity.fetch(`*[_type == "product" && defined(images)] { _id, images }`);
  let hasExtra = false;
  for (const prod of p) {
    if (!prod.images) continue;
    for (const img of prod.images) {
      const keys = Object.keys(img);
      const extraKeys = keys.filter(k => k !== "_key" && k !== "_type" && k !== "asset");
      if (extraKeys.length > 0) {
        hasExtra = true;
        console.log(`Product ${prod._id} has extra keys in image:`, extraKeys);
      }
    }
  }
  if (!hasExtra) console.log("No extra keys found.");
}
run();
