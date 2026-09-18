import { createClient } from "@sanity/client";
async function run() {
  const sanity = createClient({ projectId: 'ubqcgegx', dataset: 'production', apiVersion: '2025-12-05', useCdn: false });
  const p = await sanity.fetch(`*[_type == "category" && title match "Adult Dog Food"] { _id, title, "slug": slug.current }`);
  console.log(p);
}
run();
