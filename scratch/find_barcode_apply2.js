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

    const views = await rpc(uid, 'ir.ui.view', 'search_read', [[
        ['type', '=', 'qweb'],
        ['arch_db', 'ilike', 'Apply']
    ]], { fields: ['name', 'key', 'arch_db'] });
    
    for (const v of views) {
        if (v.arch_db.includes('Apply (') || v.arch_db.includes('btn-primary') || v.arch_db.includes('barcode')) {
            console.log(`\n=== ${v.key || v.name} ===`);
            const lines = v.arch_db.split('\n');
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('Apply')) {
                    console.log(lines[i].trim());
                }
            }
        }
    }
}
main().catch(console.error);
