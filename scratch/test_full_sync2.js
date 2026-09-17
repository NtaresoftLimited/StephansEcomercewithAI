require('dotenv').config();
const { createClient } = require('@sanity/client');
const xmlrpc = require('xmlrpc');

const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: "2023-05-03",
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
});

const url = "https://erp.stephanspetstore.co.tz"
const db = "Stephans"
const username = "info@stephanspetstore.co.tz"
const password = "Stephan@3202"

const common = xmlrpc.createSecureClient({ host: 'erp.stephanspetstore.co.tz', port: 443, path: '/xmlrpc/2/common' });
const models = xmlrpc.createSecureClient({ host: 'erp.stephanspetstore.co.tz', port: 443, path: '/xmlrpc/2/object' });

common.methodCall('authenticate', [db, username, password, {}], (error, uid) => {
    if (error) { console.error(error); return; }
    
    models.methodCall('execute_kw', [db, uid, password, 'product.template', 'search_read', 
        [[['sale_ok', '=', true]]],
        { fields: ['id', 'name', 'list_price', 'description_sale', 'categ_id', 'qty_available', 'image_1920', 'product_variant_ids'], limit: 1 }
    ], async (error, odooProducts) => {
        if (error) { console.error(error); return; }
        
        const product = odooProducts[0];
        console.log("Got product:", product.name);
        
        try {
            const sanityId = `odoo-${product.id}`;
            const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + `-${product.id}`;

            await sanityClient.createIfNotExists({
                _type: "product",
                _id: sanityId,
                name: product.name,
                slug: { _type: "slug", current: slug },
            });

            const patch = sanityClient.patch(sanityId).set({
                name: product.name,
                price: product.list_price || 0,
                description: product.description_sale || product.name,
                stock: Math.max(0, Math.floor(product.qty_available || 0)),
                odooId: product.id,
            });

            await patch.commit();
            console.log("Success");
        } catch(err) {
            console.error("Local Error:", err);
        }
    });
});
