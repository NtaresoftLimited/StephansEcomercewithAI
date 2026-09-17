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
        [[['categ_id.name', 'ilike', 'Elevated']]],
        { fields: ['id', 'name', 'qty_available', 'list_price'] }
    ], async (error, odooProducts) => {
        if (error) { console.error(error); return; }
        
        for (const product of odooProducts) {
            try {
                const sanityId = `odoo-${product.id}`;
                await sanityClient.patch(sanityId).set({
                    stock: Math.max(0, Math.floor(product.qty_available || 0)),
                    price: product.list_price || 0
                }).commit();
                console.log("Synced stock & price for:", product.name);
            } catch(err) {
                console.error("Error for", product.name, err.message);
            }
        }
    });
});
