
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { odoo } from "../lib/odoo/client";

async function findBrands() {
    const brands = await odoo.searchRead("product.brand", [], ["id", "name"]);
    console.log(`Found ${brands.length} brands in Odoo:`);
    for (const b of brands) {
        const pCount = await odoo.executeKw("product.template", "search_count", [[["brand_id", "=", b.id]]]);
        console.log(`  - [${b.id}] ${b.name}: ${pCount} products`);
    }

    // Also check products for TropiDog/TropiCat names if they are not exactly matching
    const searchNames = ["TropiDog", "TropiCat", "Tropi Dog", "Tropi Cat"];
    for (const name of searchNames) {
        const pCount = await odoo.executeKw("product.template", "search_count", [[["name", "ilike", name]]]);
        if (pCount > 0) {
            console.log(`Found ${pCount} products matching "${name}"`);
            const brandsOfProducts = await odoo.searchRead("product.template", [["name", "ilike", name]], ["brand_id"], 3);
            console.log(`  - Brand IDs for these products:`, JSON.stringify(brandsOfProducts, null, 2));
        }
    }
}

findBrands();
