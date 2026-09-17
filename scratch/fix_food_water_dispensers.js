
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

async function main() {
    // Check what category the products odoo-1024 and odoo-2422 currently have in Sanity
    const prods = await client.fetch(`*[_type == "product" && _id in ["odoo-1024", "odoo-2422"]]{ _id, name, categories }`);
    console.log("Current Sanity products:");
    prods.forEach(p => {
        console.log(`  ${p._id} | ${p.name}`);
        console.log(`    categories:`, JSON.stringify(p.categories));
    });

    // Fix: set their category to category-odoo-1215
    const catRef = "category-odoo-1215";
    const transaction = client.transaction();
    
    for (const id of ["odoo-1024", "odoo-2422"]) {
        transaction.patch(id, {
            set: {
                categories: [{
                    _key: Math.random().toString(36).substring(2, 9),
                    _type: "reference",
                    _ref: catRef
                }]
            }
        });
    }
    
    await transaction.commit();
    console.log("\n✅ Updated both products to reference category-odoo-1215");
    
    // Verify
    const verify = await client.fetch(`*[_type == "product" && references($catId)]{ _id, name, price }`, { catId: catRef });
    console.log(`\nVerification - Products in category (${verify.length}):`);
    verify.forEach(p => console.log(`  ${p._id} | ${p.name} - ${p.price} TSh`));
}
main().catch(console.error);

