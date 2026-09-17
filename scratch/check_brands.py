import xmlrpc.client

url = "https://erp.stephanspetstore.co.tz"
db = "Stephans"
username = "info@stephanspetstore.co.tz"
password = "Stephan@3202"

common = xmlrpc.client.ServerProxy("{}/xmlrpc/2/common".format(url))
uid = common.authenticate(db, username, password, {})

models = xmlrpc.client.ServerProxy("{}/xmlrpc/2/object".format(url))

brands = ["Bioline", "Summit10", "Tropicat", "Tropidog"]

for brand in brands:
    print(f"\n--- Testing Brand: {brand} ---")
    
    # Check if brand exists in product.brand
    try:
        brand_ids = models.execute_kw(db, uid, password, 'product.brand', 'search', [[['name', 'ilike', brand]]])
        if brand_ids:
            print(f"Found brand in product.brand with IDs: {brand_ids}")
            
            # Check products for this brand
            products = models.execute_kw(db, uid, password, 'product.template', 'search_read', 
                [[['brand_id', 'in', brand_ids], ['active', '=', True], ['sale_ok', '=', True]]],
                {'fields': ['name', 'website_published', 'is_published'], 'limit': 5})
            print(f"Products via brand_id ({len(products)} found, limited to 5):")
            for p in products:
                print(f"  - {p['name']} (published={p.get('is_published')})")
        else:
            print("Not found in product.brand")
    except Exception as e:
        print(f"product.brand query failed: {e}")
        
    # Check products via name ilike
    products_name = models.execute_kw(db, uid, password, 'product.template', 'search_read', 
        [[['name', 'ilike', brand], ['active', '=', True], ['sale_ok', '=', True]]],
        {'fields': ['name', 'website_published', 'is_published'], 'limit': 5})
    print(f"Products via name ilike ({len(products_name)} found, limited to 5):")
    for p in products_name:
        print(f"  - {p['name']} (published={p.get('is_published')})")
