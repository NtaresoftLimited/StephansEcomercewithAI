import { odoo } from './lib/odoo/client';
async function test() {
  const cats = await odoo.searchRead('product.public.category', [], ['id', 'name', 'parent_id']);
  console.log(cats);
}
test();
