const { createClient } = require("@sanity/client");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env" });
const xmlrpc = require("xmlrpc");

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: "2024-02-05",
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
});

const ODOO_CONFIG = {
    url: "https://erp.stephanspetstore.co.tz",
    db: "Stephans",
    user: "info@stephanspetstore.co.tz",
    pass: "Stephan@3202",
};

const LOGO_MAP = {
    "Summit10": "C:\\Users\\fisto\\Downloads\\Summit-10.svg",
    "Tropicat": "C:\\Users\\fisto\\Downloads\\TropiCat_logo.svg",
};

function odooCall(service, method, args) {
    const client = xmlrpc.createSecureClient(`${ODOO_CONFIG.url}/xmlrpc/2/${service}`);
    return new Promise((resolve, reject) => {
        client.methodCall(method, args, (err, value) => {
            if (err) reject(err);
            else resolve(value);
        });
    });
}

async function run() {
    console.log("Authenticating with Odoo...");
    const common = xmlrpc.createSecureClient(`${ODOO_CONFIG.url}/xmlrpc/2/common`);
    const uid = await new Promise((resolve, reject) => {
        common.methodCall("authenticate", [ODOO_CONFIG.db, ODOO_CONFIG.user, ODOO_CONFIG.pass, {}], (err, value) => {
            if (err) reject(err);
            else resolve(value);
        });
    });

    console.log(`Authenticated with Odoo, UID: ${uid}`);

    console.log("Fetching brands from Odoo...");
    const odooBrands = await odooCall("object", "execute_kw", [
        ODOO_CONFIG.db, uid, ODOO_CONFIG.pass,
        "product.brand", "search_read",
        [[]],
        { fields: ["id", "name", "logo"] }
    ]);

    console.log(`Found ${odooBrands.length} brands in Odoo.`);

    console.log("Fetching brands from Sanity...");
    const sanityBrands = await client.fetch('*[_type == "brand"]{_id, name, odooId}');

    for (const oBrand of odooBrands) {
        console.log(`Processing ${oBrand.name} (ID: ${oBrand.id})...`);

        // Check if brand exists in Sanity
        let sBrand = sanityBrands.find(b => b.odooId === oBrand.id || b.name.toLowerCase() === oBrand.name.toLowerCase());

        let brandId = sBrand ? sBrand._id : null;

        if (!brandId) {
            console.log(`Brand ${oBrand.name} not found in Sanity. Creating...`);
            const newBrand = await client.create({
                _type: "brand",
                name: oBrand.name,
                slug: { _type: "slug", current: oBrand.name.toLowerCase().replace(/\s+/g, "-") },
                odooId: oBrand.id,
            });
            brandId = newBrand._id;
            console.log(`Created brand: ${oBrand.name} (${brandId})`);
        } else {
            console.log(`Brand ${oBrand.name} found in Sanity: ${brandId}`);
            // Ensure odooId is set if it was matched by name
            if (!sBrand.odooId) {
                await client.patch(brandId).set({ odooId: oBrand.id }).commit();
            }
        }

        // Check for local logo upload
        const localLogo = LOGO_MAP[oBrand.name] || LOGO_MAP[Object.keys(LOGO_MAP).find(k => k.toLowerCase() === oBrand.name.toLowerCase())];
        if (localLogo && fs.existsSync(localLogo)) {
            console.log(`Uploading local logo for ${oBrand.name} from ${localLogo}...`);
            const logoBuffer = fs.readFileSync(localLogo);
            const asset = await client.assets.upload("image", logoBuffer, {
                filename: path.basename(localLogo),
                contentType: localLogo.endsWith(".svg") ? "image/svg+xml" : undefined,
            });

            console.log(`Setting logo for ${oBrand.name}...`);
            await client.patch(brandId).set({
                logo: {
                    _type: "image",
                    asset: { _type: "reference", _ref: asset._id }
                }
            }).commit();
            console.log(`Logo updated for ${oBrand.name}`);
        } else if (oBrand.logo && !localLogo) {
            // Optional: could sync from Odoo if needed, but user provided SVGs are better
            console.log(`Odoo has logo for ${oBrand.name}, but no local high-quality SVG found.`);
        }
    }

    // Cleanup duplicates (e.g. Bioline without Odoo ID)
    console.log("Cleaning up duplicates...");
    const biolineDuplicates = sanityBrands.filter(b => b.name === "Bioline" && !b.odooId);
    for (const b of biolineDuplicates) {
        console.log(`Deleting duplicate Bioline: ${b._id}`);
        await client.delete(b._id);
    }

    console.log("Sync complete!");
}

run().catch(console.error);
