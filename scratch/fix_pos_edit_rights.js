
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

    // Check access rights for relevant models for POS User group (73)
    const models = ["product.template", "product.product", "product.category", "product.public.category"];
    
    for (const model of models) {
        const access = await rpc(uid, "ir.model.access", "search_read", [[["model_id.model", "=", model]]], 
            { fields: ["name", "group_id", "perm_read", "perm_write", "perm_create", "perm_unlink"] });
        console.log(`\n=== ${model} access rules ===`);
        access.forEach(a => {
            const group = a.group_id ? a.group_id[1] : "Everyone";
            console.log(`  [${a.id}] ${a.name} | group: ${group} | R:${a.perm_read} W:${a.perm_write} C:${a.perm_create} D:${a.perm_unlink}`);
        });
    }

    // Check which groups the cashiers have
    const user11 = await rpc(uid, "res.users", "read", [11], { fields: ["name", "groups_id"] });
    console.log(`\nSales Team Masaki groups: [${user11[0].groups_id}]`);
    
    // Check if POS User (73) has write access to product.template
    const posUserAccess = await rpc(uid, "ir.model.access", "search_read", 
        [[["model_id.model", "=", "product.template"], ["group_id", "=", 73]]], 
        { fields: ["name", "perm_read", "perm_write", "perm_create", "perm_unlink"] });
    console.log("\nPOS User (73) access on product.template:", posUserAccess);
}
main().catch(console.error);

