import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2025-12-05",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

async function main() {
  const products = await client.fetch(`*[_id in ["odoo-1097", "odoo-885", "odoo-763", "odoo-3051", "odoo-2490", "odoo-2493"]] | order(name asc) {
    _id, name, odooId, price, stock, "imageCount": count(images), description,
    "brand": brand->{_id, name, "slug": slug.current}
  }`);

  console.log(JSON.stringify(products, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
