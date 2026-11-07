import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2025-12-05",
  useCdn: false,
});

async function main() {
  const result = await client.fetch(`{
    "activePriced": count(*[_type == "product" && price > 0]),
    "storefrontEligible": count(*[_type == "product" && price > 0 && defined(images[0].asset)]),
    "withoutImage": count(*[_type == "product" && price > 0 && !defined(images[0].asset)]),
    "withThreeImages": count(*[_type == "product" && price > 0 && count(images[defined(asset)]) >= 3]),
    "needsMoreImages": count(*[_type == "product" && price > 0 && defined(images[0].asset) && count(images[defined(asset)]) < 3]),
    "withDescription": count(*[_type == "product" && price > 0 && defined(images[0].asset) && defined(description) && length(description) >= 80]),
    "needsDescription": count(*[_type == "product" && price > 0 && defined(images[0].asset) && (!defined(description) || length(description) < 80)]),
    "zeroStockWithImage": count(*[_type == "product" && price > 0 && defined(images[0].asset) && stock <= 0]),
    "enrichedSet": *[_id in ["odoo-1097", "odoo-885", "odoo-763", "odoo-3051", "odoo-2490", "odoo-2493"]] | order(name asc) {
      _id,
      name,
      stock,
      "imageCount": count(images[defined(asset)]),
      "descriptionLength": length(description)
    }
  }`);

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
