import { odoo } from '../lib/odoo/client';

odoo.getPublicCategories().then(cats => {
    console.log(`Returned ${cats.length} categories.`);
    cats.forEach(c => console.log(c.display_name));
}).catch(console.error);
