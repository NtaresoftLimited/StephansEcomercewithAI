
const ODOO_URL = "https://erp.stephanspetstore.co.tz";
const DB = "Stephans";
const USER = "info@stephanspetstore.co.tz";
const PASS = "Stephan@3202";

async function rpc(uid, model, method, args, kwargs) {
    const res = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0", method: "call", params: {
                service: "object", method: "execute_kw",
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
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: { service: "common", method: "login", args: [DB, USER, PASS] }, id: 1 })
    });
    const uid = (await authRes.json()).result;

    // Check Sales Team Masaki and Sales Team Mikocheni groups
    const salesUsers = [11, 12]; // Sales Team Masaki, Sales Team Mikocheni
    
    for (const userId of salesUsers) {
        const user = await rpc(uid, "res.users", "read", [userId], { fields: ["name", "login", "groups_id"] });
        const u = user[0];
        console.log(`\n=== ${u.name} (${u.login}) ===`);
        
        // Get group details
        const groups = await rpc(uid, "res.groups", "read", [u.groups_id], { fields: ["name", "full_name", "category_id"] });
        
        // Group by category
        const byCategory = {};
        groups.forEach(g => {
            const cat = g.category_id ? g.category_id[1] : "Uncategorized";
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push({ id: g.id, name: g.name, full_name: g.full_name });
        });
        
        Object.keys(byCategory).sort().forEach(cat => {
            console.log(`  ${cat}:`);
            byCategory[cat].forEach(g => console.log(`    [${g.id}] ${g.full_name}`));
        });
    }
    
    // Also check Maria
    const maria = await rpc(uid, "res.users", "read", [8], { fields: ["name", "login", "groups_id"] });
    const m = maria[0];
    console.log(`\n=== ${m.name} (${m.login}) ===`);
    const mGroups = await rpc(uid, "res.groups", "read", [m.groups_id], { fields: ["name", "full_name", "category_id"] });
    const mByCategory = {};
    mGroups.forEach(g => {
        const cat = g.category_id ? g.category_id[1] : "Uncategorized";
        if (!mByCategory[cat]) mByCategory[cat] = [];
        mByCategory[cat].push({ id: g.id, name: g.name, full_name: g.full_name });
    });
    Object.keys(mByCategory).sort().forEach(cat => {
        console.log(`  ${cat}:`);
        mByCategory[cat].forEach(g => console.log(`    [${g.id}] ${g.full_name}`));
    });
}
main().catch(console.error);

