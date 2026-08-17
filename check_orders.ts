import { odoo } from './lib/odoo/client.ts';

async function checkOrders() {
    console.log('Fetching orders...');
    const orders = await odoo.searchRead(
        'pos.order',
        [['name', 'in', ["Stephan's Pet Store/2530", "Stephan's Pet Store/2530 REFUND"]]],
        ['id', 'name', 'state', 'session_id', 'account_move', 'picking_ids', 'payment_ids']
    );
    console.log(orders);
}

checkOrders().catch(console.error);
