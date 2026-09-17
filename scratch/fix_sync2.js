const fs = require('fs');
let content = fs.readFileSync('app/api/odoo/sync/route.ts', 'utf-8');

const regex = /let brandRef = undefined;[\s\S]*?brandRef = { _type: "reference", _ref: brandId };\s*}/;
content = content.replace(regex, 'let brandRef = undefined;');
fs.writeFileSync('app/api/odoo/sync/route.ts', content, 'utf-8');
console.log("Removed brand_id usage from sync route.");
