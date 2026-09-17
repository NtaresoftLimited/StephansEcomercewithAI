import xmlrpc.client

url = "https://erp.stephanspetstore.co.tz"
db = "Stephans"
username = "info@stephanspetstore.co.tz"
password = "Stephan@3202"

common = xmlrpc.client.ServerProxy("{}/xmlrpc/2/common".format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy("{}/xmlrpc/2/object".format(url))

categories = models.execute_kw(db, uid, password, 'product.category', 'search_read', [[['complete_name', 'ilike', 'Wet Food']]], {'fields': ['complete_name']})
print("Odoo Categories matching 'Wet Food':")
for c in categories:
    print(f"  {c['id']}: {c['complete_name']}")

print("\nFetching products in DOGS / FOOD / Wet Food...")
products = models.execute_kw(db, uid, password, 'product.template', 'search_read', 
        [[['categ_id.complete_name', 'ilike', 'DOGS / FOOD / Wet Food']]],
        {'fields': ['name', 'categ_id']})

print(f"Found {len(products)} products in Odoo:")
for p in products:
    print(f"  {p['name']}")
