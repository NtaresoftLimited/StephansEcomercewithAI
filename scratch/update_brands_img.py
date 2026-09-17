with open("app/(app)/brands/[slug]/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Update the brand query (step 3) to include image_128 check
old_query1 = """        if (odooBrandId) {
            odooProducts = await odoo.searchRead(
                "product.template",
                [["brand_id", "=", odooBrandId], ["active", "=", true]],
                ["id", "name", "list_price", "default_code", "image_512", "qty_available"],
                200
            );
        }"""
        
new_query1 = """        if (odooBrandId) {
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
content = content.replace(old_query1, new_query1)

# Update the fallback query (step 3.5) to include image_128 check
old_query2 = """                [
                    ["name", "ilike", searchTerm],
                    ["active", "=", true],
                    ["sale_ok", "=", true]
                ]"""
                
new_query2 = """                [
                    ["name", "ilike", searchTerm],
                    ["active", "=", true],
                    ["sale_ok", "=", true],
                    ["image_128", "!=", false]
                ]"""
content = content.replace(old_query2, new_query2)

with open("app/(app)/brands/[slug]/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
