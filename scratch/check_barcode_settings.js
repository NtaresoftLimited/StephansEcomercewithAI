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

    const fields = await rpc(uid, 'res.config.settings', 'fields_get', [], { attributes: ['string', 'type', 'help'] });
    const stockFields = Object.entries(fields).filter(([k, v]) => k.includes('barcode') || k.includes('stock') || k.includes('inventory'));
    
    console.log(`=== Barcode Settings Fields ===`);
    for (const [k, v] of stockFields) {
        if (k.includes('barcode')) {
            console.log(`${k}: ${v.string} - ${v.help || ''}`);
        }
    }
}
main().catch(console.error);
