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
            <xpath expr="//t[@t-set='head_web']" position="inside">
                <t t-if="not request.env.user.has_group('stock.group_stock_manager')">
                    <style>
                        /* Hide Apply / Validate buttons in Barcode App for non-managers */
                        .o_barcode_client_action button.o_validate_page,
                        .o_barcode_client_action button.o_barcode_btn_validate,
                        .o_barcode_client_action button.o_apply_page,
                        .o_barcode_client_action button.btn-primary.o_validate,
                        .o_barcode_client_action button[name='action_validate'],
                        .o_barcode_client_action button.btn-secondary:last-child {
                            display: none !important;
                        }
                    </style>
                </t>
            </xpath>
        </data>
    `;

    const existing = await rpc(uid, 'ir.ui.view', 'search_read', [[['name', '=', 'web.hide.barcode.apply']]], { fields: ['id'] });
    if (existing.length > 0) {
        await rpc(uid, 'ir.ui.view', 'write', [[existing[0].id], { arch_base: viewDef }]);
        console.log('Updated existing view');
    } else {
        const inheritId = await rpc(uid, 'ir.ui.view', 'search_read', [[['name', '=', 'web.webclient_bootstrap']]], { fields: ['id'] });
        
        await rpc(uid, 'ir.ui.view', 'create', [{
            name: 'web.hide.barcode.apply',
            model: false,
            inherit_id: inheritId[0].id,
            arch_base: viewDef,
            type: 'qweb'
        }]);
        console.log('Created inherited view to hide Apply button in Barcode App');
    }
}
main().catch(console.error);
