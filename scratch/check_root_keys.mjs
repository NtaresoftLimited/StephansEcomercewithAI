import { createClient } from "@sanity/client";
async function run() {
  const sanity = createClient({ projectId: 'ubqcgegx', dataset: 'production', apiVersion: '2025-12-05', useCdn: false });
  const p = await sanity.fetch(`*[_type == "product" && _id == "odoo-1594"]`);
  console.log(Object.keys(p[0]));
}
run();
