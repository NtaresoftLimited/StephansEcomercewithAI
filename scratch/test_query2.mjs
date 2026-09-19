import { createClient } from "@sanity/client";
async function run() {
  const sanity = createClient({ projectId: 'ubqcgegx', dataset: 'production', apiVersion: '2025-12-05', useCdn: false });
  const p = await sanity.fetch(`*[_type == "product" && _id == "odoo-1594"] { 
    name,
    "images": images[0...4]{
      _key,
      asset->{
        _id,
        url
      }
    }
  }`);
  console.log(JSON.stringify(p, null, 2));
}
run();
