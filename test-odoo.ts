import { odoo } from './lib/odoo/client.ts';
async function test() {
  try {
    const prods = await odoo.searchRead('product.template', [['name', 'ilike', 'bioline']], ['id', 'name']);
    console.log('Bioline products by name:', prods.length);
    const brands = await odoo.searchRead('product.brand', [['name', 'ilike', 'bioline']], ['id', 'name']);
    console.log('Brands found:', brands);
  } catch(e: any) { console.error('Error:', e.message); }
}
test();
