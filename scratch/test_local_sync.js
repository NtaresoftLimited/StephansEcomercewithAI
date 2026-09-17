require('dotenv').config();
const { createClient } = require('@sanity/client');
const odoo = require('./lib/odoo/client').odoo;

const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: "2023-05-03",
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
});

async function run() {
    const odooProducts = await odoo.searchRead(
        "product.template",
        [["sale_ok", "=", true]],
        [
            "id",
            "name",
            "list_price",
            "description_sale",
            "categ_id",
            "qty_available",
            "image_1920",
            "product_variant_ids"
        ],
        1 // just 1 product
    );
    const product = odooProducts[0];
    
    try {
        const sanityId = `odoo-${product.id}`;
        const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + `-${product.id}`;

        await sanityClient.createIfNotExists({
            _type: "product",
            _id: sanityId,
            name: product.name,
            slug: { _type: "slug", current: slug },
        });
        
        let categoryRef = undefined;
        // Skipping category for simple test
        
        const patch = sanityClient.patch(sanityId).set({
            name: product.name,
            price: product.list_price || 0,
            description: product.description_sale || product.name,
            stock: Math.max(0, Math.floor(product.qty_available || 0)),
            odooId: product.id,
        });
        
        // Let's intentionally NOT include brand logic here and see if it fails
        // Wait, did I forget to remove getOrCreateBrand(product.brand_id[1]) on the server?
        if (product.brand_id) {
            console.log("WAIT, brand_id is still here?", product.brand_id);
        }
        
        await patch.commit();
        console.log("Success");
    } catch(err) {
        console.error("Local Error:", err);
    }
}
run();
