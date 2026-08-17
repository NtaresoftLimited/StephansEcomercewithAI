import { odoo } from './lib/odoo/client.ts';

async function listRootCategories() {
    console.log('Fetching root POS categories...');
    const categories = await odoo.searchRead(
        'pos.category',
        [['parent_id', '=', false]],
        ['id', 'name']
    );
    console.log(categories);
}

listRootCategories().catch(console.error);
