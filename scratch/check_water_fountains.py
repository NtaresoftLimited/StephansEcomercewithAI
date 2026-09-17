import xmlrpc.client

url = "https://erp.stephanspetstore.co.tz"
db = "Stephans"
username = "info@stephanspetstore.co.tz"
password = "Stephan@3202"

common = xmlrpc.client.ServerProxy("{}/xmlrpc/2/common".format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy("{}/xmlrpc/2/object".format(url))

categories = models.execute_kw(db, uid, password, 'product.category', 'search_read', [[['complete_name', 'ilike', 'Water Fountains']]], {'fields': ['complete_name']})
print("Odoo Categories matching 'Water Fountains':")
for c in categories:
    print(f"  {c['id']}: {c['complete_name']}")

print("\nFetching products in Water Fountains...")
products = models.execute_kw(db, uid, password, 'product.template', 'search_read', 
        [[['categ_id.complete_name', 'ilike', 'Water Fountains']]],
        {'fields': ['name', 'categ_id']})

for p in products:
    print(f"  {p['name']} -> {p['categ_id'][1]}")
