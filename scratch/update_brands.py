with open("app/(app)/brands/[slug]/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the fallback search part
old_code = """        // 3.5 Fallback: Search by name if no products found by brand ID
        if (odooProducts.length === 0) {
            console.log(`No products found for brand ID ${odooBrandId}, falling back to name search for: ${brand.name}`);
            odooProducts = await odoo.searchRead(
                "product.template",
                [
                    ["name", "ilike", brand.name],
                    ["active", "=", true],
                    ["sale_ok", "=", true]
                ],
                ["id", "name", "list_price", "default_code", "image_512", "qty_available"],
                200
            );
        }"""

new_code = """        // 3.5 Fallback: Search by name if no products found by brand ID
        if (odooProducts.length === 0) {
            let searchTerm = brand.name;
            if (slugLower === 'summit10') searchTerm = 'Summit 10';
            else if (slugLower === 'tropicat' || slugLower === 'tropidog') searchTerm = 'Tropi';
            
            console.log(`No products found for brand ID ${odooBrandId}, falling back to name search for: ${searchTerm}`);
            odooProducts = await odoo.searchRead(
                "product.template",
                [
                    ["name", "ilike", searchTerm],
                    ["active", "=", true],
                    ["sale_ok", "=", true]
                ],
                ["id", "name", "list_price", "default_code", "image_512", "qty_available"],
                200
            );
            
            // Filter if Tropi to match specific categories or just name
            if (slugLower === 'tropicat') {
                odooProducts = odooProducts.filter((p: any) => p.name.toLowerCase().includes('cat') || p.name.toLowerCase().includes('kitten') || p.name.toLowerCase().includes('purr'));
            } else if (slugLower === 'tropidog') {
                odooProducts = odooProducts.filter((p: any) => p.name.toLowerCase().includes('dog') || p.name.toLowerCase().includes('puppy'));
            }
        }"""

if old_code in content:
    content = content.replace(old_code, new_code)
    with open("app/(app)/brands/[slug]/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Replaced fallback search logic.")
else:
    print("Could not find old fallback search logic.")
