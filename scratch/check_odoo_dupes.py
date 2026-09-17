import xmlrpc.client
from collections import Counter

url = "https://erp.stephanspetstore.co.tz"
db = "Stephans"
username = "info@stephanspetstore.co.tz"
password = "Stephan@3202"

common = xmlrpc.client.ServerProxy("{}/xmlrpc/2/common".format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy("{}/xmlrpc/2/object".format(url))

products = models.execute_kw(db, uid, password, 'product.template', 'search_read', 
        [[['active', '=', True], ['sale_ok', '=', True], ['image_128', '!=', False]]],
        {'fields': ['name', 'categ_id', 'website_published']})

print(f"Total published products: {len(products)}")

names = [p['name'].strip() for p in products]
counts = Counter(names)
duplicates = {name: count for name, count in counts.items() if count > 1}

print(f"Unique product names: {len(set(names))}")
if duplicates:
    print(f"Found {len(duplicates)} duplicate names in Odoo.")
    # Show first 10
    for i, (k, v) in enumerate(duplicates.items()):
        if i < 10:
            print(f"  {k}: {v}")
else:
    print("No duplicates in Odoo.")
