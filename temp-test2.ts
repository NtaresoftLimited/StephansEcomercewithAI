import { odoo } from './lib/odoo/client';
async function test() {
  const cats = await odoo.searchRead('product.category', [], ['id', 'name', 'parent_id', 'complete_name']);
  console.log(cats);
}
test();
