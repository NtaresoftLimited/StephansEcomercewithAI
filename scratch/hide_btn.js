const ODOO_URL = 'https://erp.stephanspetstore.co.tz';
const DB = 'Stephans';
const USER = 'info@stephanspetstore.co.tz';
const PASS = 'Stephan@3202';

async function rpc(uid, model, method, args, kwargs) {
    const res = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0', method: 'call', params: {
                service: 'object', method: 'execute_kw',
                args: [DB, uid, PASS, model, method, args, kwargs || {}]
            }, id: Math.random()
        })
    });
    const data = await res.json();
    if (data.error) throw new Error(JSON.stringify(data.error.data?.message || data.error));
    return data.result;
}

async function main() {
    const authRes = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { service: 'common', method: 'login', args: [DB, USER, PASS] }, id: 1 })
    });
    const uid = (await authRes.json()).result;

    const viewDef = `
        <data>
            <xpath expr="//header/button[@name='action_update_quantity_on_hand']" position="attributes">
                <attribute name="groups">stock.group_stock_manager</attribute>
            </xpath>
            <xpath expr="//button[@name='action_update_quantity_on_hand'][contains(@class, 'oe_stat_button')]" position="attributes">
                <attribute name="groups">stock.group_stock_manager</attribute>
            </xpath>
        </data>
    `;

    const existing = await rpc(uid, 'ir.ui.view', 'search_read', [[['name', '=', 'product.template.hide.update.qty']]], { fields: ['id'] });
    if (existing.length > 0) {
        await rpc(uid, 'ir.ui.view', 'write', [[existing[0].id], { arch_base: viewDef }]);
        console.log('Updated existing view');
    } else {
        const inheritId = await rpc(uid, 'ir.ui.view', 'search_read', [[['name', '=', 'product.template_procurement']]], { fields: ['id'] });
        
        await rpc(uid, 'ir.ui.view', 'create', [{
            name: 'product.template.hide.update.qty',
            model: 'product.template',
            inherit_id: inheritId[0].id,
            arch_base: viewDef,
            type: 'form'
        }]);
        console.log('Created inherited view to hide Update Quantity from non-managers');
    }
}
main().catch(console.error);
