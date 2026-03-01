
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { odoo } from "../lib/odoo/client";

async function checkProducts() {
    const brands = [
        { id: 13, name: "Tropidog" },
        { id: 14, name: "Tropicat" },
        { id: 5, name: "Summit10" },
        { id: 2, name: "Bioline" }
    ];

    for (const brand of brands) {
        console.log(`Checking products for brand: ${brand.name} (ID: ${brand.id})`);
        const pCount = await odoo.executeKw("product.template", "search_count", [[["brand_id", "=", brand.id]]]);
        console.log(`  - Total products: ${pCount}`);
        if (pCount > 0) {
            const pSample = await odoo.searchRead("product.template", [["brand_id", "=", brand.id]], ["name", "active", "sale_ok"], 3);
            console.log(`  - Samples:`, JSON.stringify(pSample, null, 2));
        }
    }
}

checkProducts();
