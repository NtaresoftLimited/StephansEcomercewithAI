const { createClient } = require('next-sanity');
const client = createClient({
    projectId: 'ubqcgegx',
    dataset: 'production',
    apiVersion: '2025-12-05',
    useCdn: false,
    token: 'skfUPfbsioPFyNKlkDy7gOxwWCdoGkl9XUnpW41s59JT92GI6Nn4BfwV3aoXnp8c5p8T8rsiHQyCEAiy1wdchHIuwm0HIFnMDSyL8VV0K8Iq2e9wzC84vmDby7bEOqgsvN3odNfp1kMHtxFihQoIPvusDiA6HJy5jEFtwJWDWujrYoHAxfWA',
});

const correctIds = {
    'bioline': 5,
    'tropicat': 2,
    'tropidog': 13,
    'summit10': 14
};

async function main() {
    const brands = await client.fetch('*[_type == "brand"]{_id, slug, name, odooId}');
    for (const brand of brands) {
        if (!brand.slug || !brand.slug.current) continue;
        const slug = brand.slug.current.toLowerCase();
        
        if (correctIds[slug] !== undefined) {
            const correctId = correctIds[slug];
            if (brand.odooId !== correctId) {
                console.log(`Fixing ${brand.name}: changing odooId from ${brand.odooId} to ${correctId}`);
                await client.patch(brand._id)
                    .set({ odooId: correctId })
                    .commit();
            } else {
                console.log(`${brand.name} is already correct (${correctId})`);
            }
        }
    }
}

main().catch(console.error);
