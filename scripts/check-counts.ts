import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { createClient } from "@sanity/client";
import { odoo } from "../lib/odoo/client";

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2025-12-05',
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
});

async function checkProducts() {
    console.log("Checking Odoo products...");
    const odooProducts = await odoo.searchRead(
        "product.template",
        [["sale_ok", "=", true], ["active", "=", true]],
        ["name", "id"],
        2000
    );
    console.log(`Total active sale_ok products in Odoo: ${odooProducts.length}`);

    console.log("Checking Sanity products...");
    const sanityProducts = await client.fetch(`*[_type == "product"]{_id, name, odooId, "brandName": brand->name}`);
    console.log(`Total products in Sanity: ${sanityProducts.length}`);

    const odooIds = new Set(odooProducts.map((p: any) => p.id));
    const sanityOdooIds = new Set(sanityProducts.map((p: any) => p.odooId).filter(Boolean));

    const missingInSanity = odooProducts.filter((p: any) => !sanityOdooIds.has(p.id));
    console.log(`Products in Odoo missing from Sanity: ${missingInSanity.length}`);
    if (missingInSanity.length > 0) {
        missingInSanity.forEach((p: any) => console.log(` - [${p.id}] ${p.name}`));
    }

    const missingInOdoo = sanityProducts.filter((p: any) => p.odooId && !odooIds.has(p.odooId));
    console.log(`Products in Sanity missing from Odoo: ${missingInOdoo.length}`);
}

checkProducts().catch(console.error);
