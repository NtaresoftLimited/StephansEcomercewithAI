
import { odoo } from "../lib/odoo/client";

async function inspectProducts() {
    console.log("Fetching sample products from Odoo...");
    try {
        const products = await odoo.searchRead(
            "product.template",
            [["sale_ok", "=", true]],
            ["name", "list_price", "description_sale", "categ_id", "qty_available", "image_1920"],
            5
        );

        console.log("Sample Products Details:");
        products.forEach(p => {
            console.log(`- ${p.name}: TZS ${p.list_price} | Cat: ${p.categ_id[1]} | Stock: ${p.qty_available}`);
            // Don't log full image data as it's a huge base64 string
            if (p.image_1920) console.log("  [Has Image]");
        });

    } catch (error) {
        console.error("Fetch failed:", error);
    }
}

inspectProducts();
