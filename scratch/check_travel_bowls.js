
const ODOO_URL = "https://erp.stephanspetstore.co.tz";
const DB = "Stephans";
const USER = "info@stephanspetstore.co.tz";
const PASS = "Stephan@3202";
const sanityClient = require("@sanity/client");
require("dotenv").config({ path: ".env" });

const client = sanityClient.createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    useCdn: false,
    apiVersion: "2023-05-03",
    token: process.env.SANITY_API_WRITE_TOKEN,
});

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
    if (data.error) throw new Error(JSON.stringify(data.error));
    return data.result;
}

async function main() {
    const authRes = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: { service: "common", method: "login", args: [DB, USER, PASS] }, id: 1 })
    });
    const uid = (await authRes.json()).result;

    // Find category
    const cats = await rpc(uid, "product.category", "search_read", [[["name", "ilike", "Travel Bowls"]]], { fields: ["name", "parent_id", "complete_name"] });
    console.log("=== Odoo Travel Bowls Categories ===");
    cats.forEach(c => console.log(`  ID: ${c.id} | ${c.complete_name}`));
    
    const dogCat = cats.find(c => c.complete_name && c.complete_name.includes("DOGS"));
    if (!dogCat) {
        console.log("ERROR: Not found under DOGS. Searching broader...");
        const allCats = await rpc(uid, "product.category", "search_read", [[["complete_name", "ilike", "%DOGS%BOWLS%"]]], { fields: ["name", "complete_name"] });
        console.log("\nAll DOGS BOWLS categories:");
        allCats.forEach(c => console.log(`  ID: ${c.id} | ${c.complete_name}`));
        return;
    }
    console.log(`\nUsing: ${dogCat.complete_name} (ID: ${dogCat.id})`);

    // Get Odoo products
    const odooProducts = await rpc(uid, "product.template", "search_read", [[["categ_id", "child_of", dogCat.id], ["active", "=", true]]], { fields: ["name", "list_price"] });
    console.log(`\n=== Odoo Products (${odooProducts.length}) ===`);
    odooProducts.sort((a, b) => a.name.localeCompare(b.name));
    odooProducts.forEach(p => console.log(`  [${p.id}] ${p.name} - ${p.list_price} TSh`));

    // Check Sanity
    const catId = `category-odoo-${dogCat.id}`;
    const sanityCat = await client.fetch(`*[_type == "category" && _id == $catId]{ _id, title, slug }`, { catId });
    console.log(`\n=== Sanity Category ===`);
    if (sanityCat.length > 0) {
        console.log(`  ${sanityCat[0]._id} | ${sanityCat[0].title} | slug: ${sanityCat[0].slug?.current}`);
    } else {
        console.log("  NOT FOUND in Sanity!");
    }

    const sanityProducts = await client.fetch(`*[_type == "product" && references($catId)]{ _id, name, price }`, { catId });
    console.log(`\n=== Sanity Products (${sanityProducts.length}) ===`);
    sanityProducts.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    sanityProducts.forEach(p => console.log(`  ${p._id} | ${p.name} - ${p.price} TSh`));

    // Compare
    const odooNames = odooProducts.map(p => p.name).sort();
    const sanityNames = sanityProducts.map(p => p.name).sort();
    const missingInSanity = odooNames.filter(n => !sanityNames.includes(n));
    const extraInSanity = sanityNames.filter(n => !odooNames.includes(n));
    
    console.log(`\n=== Sync Summary ===`);
    console.log(`Odoo: ${odooProducts.length} | Sanity: ${sanityProducts.length}`);
    if (missingInSanity.length > 0) {
        console.log(`Missing in Sanity (${missingInSanity.length}):`);
        missingInSanity.forEach(n => console.log(`  ❌ ${n}`));
    }
    if (extraInSanity.length > 0) {
        console.log(`Extra in Sanity (${extraInSanity.length}):`);
        extraInSanity.forEach(n => console.log(`  ⚠️ ${n}`));
    }
    if (missingInSanity.length === 0 && extraInSanity.length === 0) {
        console.log(`\n✅ Perfectly synced!`);
    }
    
    // Fix missing products if any
    if (missingInSanity.length > 0) {
        const missingOdooProds = odooProducts.filter(p => missingInSanity.includes(p.name));
        const transaction = client.transaction();
        for (const p of missingOdooProds) {
            const sanityId = `odoo-${p.id}`;
            transaction.patch(sanityId, {
                set: {
                    categories: [{
                        _key: Math.random().toString(36).substring(2, 9),
                        _type: "reference",
                        _ref: catId
                    }]
                }
            });
        }
        await transaction.commit();
        console.log(`\n🔧 Fixed ${missingOdooProds.length} products - assigned to ${catId}`);
    }
    
    // Fix slug if needed
    const navSlug = "travel-bowls-water-bottles";
    if (sanityCat.length > 0 && sanityCat[0].slug?.current !== navSlug) {
        await client.patch(catId).set({ slug: { _type: "slug", current: navSlug } }).commit();
        console.log(`🔧 Fixed slug: ${sanityCat[0].slug?.current} → ${navSlug}`);
    }
}
main().catch(console.error);

