import { odoo } from './lib/odoo/client.ts';

async function checkHiddenCategories() {
    console.log('Fetching unknown POS categories...');
    const categories = await odoo.searchRead(
        'pos.category',
        [['id', 'in', [3, 4, 6]]],
        ['id', 'name', 'parent_id']
    );
    console.log(categories);
}

checkHiddenCategories().catch(console.error);
