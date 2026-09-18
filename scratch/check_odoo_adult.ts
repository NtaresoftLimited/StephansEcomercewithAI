import { odoo } from "../lib/odoo/client.ts";

async function run() {
  const c = await odoo.getPublicCategories();
  const ac = c.find(cat => cat.display_name === 'DOGS / FOOD / Adult Dog Food');
  
  if (!ac) {
    console.log("Category not found!");
    return;
  }
  
  console.log("Odoo Category ID:", ac.id);
  const p = await odoo.searchRead(
    'product.template', 
    [['sale_ok', '=', true], ['active', '=', true], ['categ_id', 'child_of', ac.id]], 
    ['name']
  );
  console.log('Odoo adult dog food count:', p.length);
  if (p.length > 0) {
    console.log(p.slice(0, 5));
  }
}
run();
