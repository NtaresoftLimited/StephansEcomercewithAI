
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

    // Grant Write access to POS User (73) for product.template and product.product
    
    // product.template pos user is ID 968
    await rpc(uid, "ir.model.access", "write", [[968], { perm_write: true }]);
    console.log("✅ Granted Write access on product.template to POS User (Group 73)");

    // product.product is ID 967
    await rpc(uid, "ir.model.access", "write", [[967], { perm_write: true }]);
    console.log("✅ Granted Write access on product.product to POS User (Group 73)");

    // Verify
    const verifyTemplate = await rpc(uid, "ir.model.access", "read", [[968]], { fields: ["name", "perm_read", "perm_write", "perm_create"] });
    console.log("product.template:", verifyTemplate);
    
    const verifyProduct = await rpc(uid, "ir.model.access", "read", [[967]], { fields: ["name", "perm_read", "perm_write", "perm_create"] });
    console.log("product.product:", verifyProduct);
}
main().catch(console.error);

