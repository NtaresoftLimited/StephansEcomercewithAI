import xmlrpc.client

url = "https://erp.stephanspetstore.co.tz"
db = "Stephans"
username = "info@stephanspetstore.co.tz"
password = "Stephan@3202"

common = xmlrpc.client.ServerProxy("{}/xmlrpc/2/common".format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy("{}/xmlrpc/2/object".format(url))

products = models.execute_kw(db, uid, password, 'product.template', 'search_read', 
        [[['name', 'ilike', 'tropi']]],
        {'fields': ['name']})
print(f"Total Tropi products: {len(products)}")
for p in products:
    print(f"  - {p['name']}")
