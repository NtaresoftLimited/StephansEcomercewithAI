with open("app/(app)/brands/[slug]/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_logic = """        if (odooBrandId) {
            odooProducts = await odoo.searchRead(
                "product.template",
                [
                    ["brand_id", "=", odooBrandId], 
                    ["active", "=", true], 
                    ["sale_ok", "=", true],
                    ["image_128", "!=", false]
                ],
                ["id", "name", "list_price", "default_code", "image_512", "qty_available"],
                200
            );
        }"""
        
new_logic = """        if (odooBrandId) {
            try {
                odooProducts = await odoo.searchRead(
                    "product.template",
                    [
                        ["brand_id", "=", odooBrandId], 
                        ["active", "=", true], 
                        ["sale_ok", "=", true],
                        ["image_128", "!=", false]
                    ],
                    ["id", "name", "list_price", "default_code", "image_512", "qty_available"],
                    200
                );
            } catch (err: any) {
                console.log(`Failed to fetch by brand_id (module might be missing): ${err.message}`);
            }
        }"""

content = content.replace(old_logic, new_logic)

with open("app/(app)/brands/[slug]/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
