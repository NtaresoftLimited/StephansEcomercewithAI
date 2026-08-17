import { odoo } from './lib/odoo/client.ts';

async function checkSessions() {
    console.log('Fetching sessions...');
    const sessions = await odoo.searchRead(
        'pos.session',
        [['id', 'in', [540, 546]]],
        ['id', 'name', 'state']
    );
    console.log(sessions);
}

checkSessions().catch(console.error);
