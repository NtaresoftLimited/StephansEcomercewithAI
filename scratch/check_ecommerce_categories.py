import xmlrpc.client

url = "https://erp.stephanspetstore.co.tz"
db = "Stephans"
username = "info@stephanspetstore.co.tz"
password = "Stephan@3202"

common = xmlrpc.client.ServerProxy("{}/xmlrpc/2/common".format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy("{}/xmlrpc/2/object".format(url))

categories = models.execute_kw(db, uid, password, 'product.public.category', 'search_read', 
        [[]],
        {'fields': ['name', 'parent_id', 'display_name']})

from collections import Counter
names = [c['display_name'] for c in categories]
counts = Counter(names)
duplicates = {name: count for name, count in counts.items() if count > 1}

print(f"Total eCommerce categories: {len(categories)}")
if duplicates:
    print("Duplicate eCommerce Categories found:", duplicates)
else:
    print("No duplicates in eCommerce categories (product.public.category).")
