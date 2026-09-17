const fs = require('fs');
let content = fs.readFileSync('app/api/odoo/sync/route.ts', 'utf-8');

content = content.replace('"brand_id",', '');

fs.writeFileSync('app/api/odoo/sync/route.ts', content, 'utf-8');
console.log("Removed brand_id from sync route.");
