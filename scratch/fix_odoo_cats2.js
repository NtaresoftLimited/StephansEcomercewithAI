const fs = require('fs');
let content = fs.readFileSync('app/(app)/shop/[[...categorySlug]]/page.tsx', 'utf-8');

const regex = /\/\/ Merge Odoo and Sanity Categories for the filter sidebar[\s\S]*?\}\)\);\s*/;

const newMapping = `  // Merge Odoo and Sanity Categories for the filter sidebar
  const mappedOdooCategories = (odooCategories || []).map((c: any) => {
    let parentCategory = null;
    if (c.parent_id && Array.isArray(c.parent_id)) {
        const parentId = c.parent_id[0];
        const parentOdooCat = odooCategories.find((oc: any) => oc.id === parentId);
        if (parentOdooCat) {
            parentCategory = {
                title: parentOdooCat.name,
                slug: { current: (parentOdooCat.display_name || parentOdooCat.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }
            };
        }
    }
    return {
        _id: \`odoo-cat-\${c.id}\`,
        title: c.name,
        displayName: c.display_name,
        slug: { current: (c.display_name || c.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') },
        parentCategory
    };
  });
  
`;

content = content.replace(regex, newMapping);
fs.writeFileSync('app/(app)/shop/[[...categorySlug]]/page.tsx', content, 'utf-8');
console.log("Updated mappedOdooCategories with regex");
