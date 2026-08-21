import { odoo } from './lib/odoo/client';
async function test() {
  const prods = await odoo.searchRead('product.template', [['sale_ok', '=', true]], ['id', 'name', 'categ_id']);
  console.log('Total Products:', prods.length);
}
test();
