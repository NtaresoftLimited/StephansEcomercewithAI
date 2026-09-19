import { createClient } from "@sanity/client";
async function run() {
  const sanity = createClient({ projectId: 'ubqcgegx', dataset: 'production', apiVersion: '2025-12-05', useCdn: false });
  const p = await sanity.fetch(`*[_type == "product" && (!defined(images) || count(images) == 0)] { name }`);
  console.log("NO IMAGES:", p.map(x => x.name));
}
run();
