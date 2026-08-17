import { odoo } from './lib/odoo/client.ts';

async function cleanupPOS() {
    console.log('Fetching POS categories...');
    const categories = await odoo.searchRead(
        'pos.category',
        [],
        ['id', 'name', 'parent_id']
    );
    console.log(categories);
}

cleanupPOS().catch(console.error);
