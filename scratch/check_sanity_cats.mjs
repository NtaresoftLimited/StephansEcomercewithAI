import { createClient } from "@sanity/client";

async function run() {
  const sanity = createClient({ projectId: 'ubqcgegx', dataset: 'production', apiVersion: '2025-12-05', useCdn: false });
  const ids = [2495, 2493, 2492, 2491, 1129].map(id => `odoo-${id}`);
  
  const p = await sanity.fetch(`*[_type == "product" && _id in $ids] { _id, name, "categories": categories[]->title }`, { ids });
  console.log(p);
}
run();
