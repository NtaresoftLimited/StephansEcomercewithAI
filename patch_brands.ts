import { createClient } from 'next-sanity';

const sanityClient = createClient({
    projectId: 'ubqcgegx',
    dataset: 'production',
    apiVersion: '2025-12-05',
    useCdn: false,
    token: 'skfUPfbsioPFyNKlkDy7gOxwWCdoGkl9XUnpW41s59JT92GI6Nn4BfwV3aoXnp8c5p8T8rsiHQyCEAiy1wdchHIuwm0HIFnMDSyL8VV0K8Iq2e9wzC84vmDby7bEOqgsvN3odNfp1kMHtxFihQoIPvusDiA6HJy5jEFtwJWDWujrYoHAxfWA',
});

const ODOO_URL = 'https://erp.stephanspetstore.co.tz';
const ODOO_DB = 'Stephans';
const ODOO_USER = 'info@stephanspetstore.co.tz';
const ODOO_PASSWORD = 'Stephan@3202';

async function odooAuth(): Promise<number> {
  const res = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', method: 'call', id: 1,
      params: { service: 'common', method: 'authenticate', args: [ODOO_DB, ODOO_USER, ODOO_PASSWORD, {}] }
    })
  });
  const data = await res.json();
  return data.result;
}

async function odooRpc(uid: number, model: string, method: string, args: any[], kwargs: any = {}): Promise<any> {
  const res = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', method: 'call', id: 2,
      params: { service: 'object', method: 'execute_kw', args: [ODOO_DB, uid, ODOO_PASSWORD, model, method, args, kwargs] }
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.data?.message || JSON.stringify(data.error));
  return data.result;
}

async function getOrCreateBrand(name: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const existing = await sanityClient.fetch(
        `*[_type == "brand" && slug.current == $slug][0]`,
        { slug }
    );
    if (existing) return existing._id;
    const created = await sanityClient.create({
        _type: "brand",
        name: name,
        slug: { _type: "slug", current: slug },
    });
    return created._id;
}

async function main() {
  console.log('Connecting to Odoo...');
  const uid = await odooAuth();
  
  // 1. Get all products from Odoo with brand_id
  console.log('Fetching products from Odoo...');
  const products = await odooRpc(uid, 'product.template', 'search_read', 
    [[['sale_ok', '=', true]]], 
    { fields: ['id', 'name', 'brand_id'] }
  );
  
  console.log(`Found ${products.length} products in Odoo.`);
  
  // 2. Fetch existing products in Sanity
  console.log('Fetching products from Sanity...');
  const sanityProducts = await sanityClient.fetch(`*[_type == "product"]{_id, name, odooId}`);
  const sanityMap = new Map();
  for (const p of sanityProducts) {
      if (p.odooId) sanityMap.set(p.odooId, p._id);
  }
  
  let updatedCount = 0;
  
  for (const p of products) {
      if (!p.brand_id) continue;
      
      const sanityId = sanityMap.get(p.id) || `odoo-${p.id}`;
      const brandName = p.brand_id[1];
      
      try {
          const brandSanityId = await getOrCreateBrand(brandName);
          
          await sanityClient.patch(sanityId)
            .set({ brand: { _type: "reference", _ref: brandSanityId } })
            .commit();
            
          console.log(`✅ Updated ${p.name} with brand ${brandName}`);
          updatedCount++;
      } catch (err) {
          console.error(`❌ Failed to update ${p.name}:`, err);
      }
  }
  
  console.log(`\nFinished! Updated ${updatedCount} products with brand information.`);
}

main().catch(console.error);
