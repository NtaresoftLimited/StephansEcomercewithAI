import { odoo } from '../lib/odoo/client';
odoo.searchRead("product.template", [
    ["name", "ilike", "Bioline"],
    ["active", "=", true],
    ["sale_ok", "=", true],
    ["image_128", "!=", false]
], ["id", "name"], 10).then(console.log).catch(console.error);
