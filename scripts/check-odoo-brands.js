
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { odoo } from "../lib/odoo/client";

async function checkOdooBrands() {
    try {
        console.log("Checking for product.brand model...");
        const brands = await odoo.searchRead("product.brand", [], ["id", "name"], 10);
        console.log("Found brands in product.brand:", JSON.stringify(brands, null, 2));
    } catch (e) {
        console.log("product.brand model not found or error:", e.message);
    }

    try {
        console.log("Checking for res.brand model...");
        const brands = await odoo.searchRead("res.brand", [], ["id", "name"], 10);
        console.log("Found brands in res.brand:", JSON.stringify(brands, null, 2));
    } catch (e) {
        console.log("res.brand model not found or error:", e.message);
    }

    try {
        console.log("Checking product.template fields for brand...");
        const fields = await odoo.executeKw("product.template", "fields_get", [["brand_id", "x_brand_id", "brand"]]);
        console.log("Product template brand fields:", JSON.stringify(fields, null, 2));
    } catch (e) {
        console.log("Error checking product.template fields:", e.message);
    }
}

checkOdooBrands();
