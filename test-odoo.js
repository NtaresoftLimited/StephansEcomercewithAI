const { OdooClient } = require('./lib/odoo/client');
require('dotenv').config({ path: '.env.local' });
const odoo = new OdooClient(
  process.env.ODOO_URL,
  process.env.ODOO_DB,
  process.env.ODOO_USERNAME,
  process.env.ODOO_PASSWORD
);
async function test() {
  try {
    const prods = await odoo.searchRead('product.template', [['name', 'ilike', 'bioline']], ['id', 'name', 'brand_id']);
    console.log('Bioline products by name:', prods);
    const brands = await odoo.searchRead('product.brand', [['name', 'ilike', 'bioline']], ['id', 'name']);
    console.log('Brands found:', brands);
  } catch(e) { console.error('Error:', e.message); }
}
test();
