
import { odoo } from "../lib/odoo/client";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    try {
        console.log("Connecting to Odoo...");

        // Test 1: Get Brand by Slug
        console.log("\nTesting getBrandBySlug('beeno')...");
        const brand = await odoo.getBrandBySlug("beeno");
        if (brand) {
            console.log("✅ Brand found:", brand.name, "(ID:", brand.id, ")");

            // Test 2: Get Products by Brand
            console.log("\nTesting getProductsByBrand for ID:", brand.id);
            const products = await odoo.getProductsByBrand(brand.id);
            console.log(`Found ${products.length} products.`);
            products.forEach((p: any) => console.log(` - ${p.name} (Price: ${p.list_price})`));

            if (products.some((p: any) => p.name.includes("Bello"))) {
                console.log("✅ 'Bello' product found in brand list.");
            } else {
                console.log("❌ 'Bello' product NOT found in brand list.");
            }

        } else {
            console.log("❌ Brand 'beeno' NOT found.");
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

main();
