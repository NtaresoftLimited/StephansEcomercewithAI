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

    const rules = await rpc(uid, 'ir.model.access', 'search_read', [[
        ['model_id.model', '=', 'stock.quant']
    ]], { fields: ['name', 'group_id', 'perm_write'] });
    
    console.log(`=== stock.quant access rules ===`);
    for (const r of rules) {
        console.log(`${r.name} | group: ${r.group_id ? r.group_id[1] : 'all'} | write: ${r.perm_write}`);
    }
}
main().catch(console.error);
