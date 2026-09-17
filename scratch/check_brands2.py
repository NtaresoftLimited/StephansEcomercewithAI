import xmlrpc.client

url = "https://erp.stephanspetstore.co.tz"
db = "Stephans"
username = "info@stephanspetstore.co.tz"
password = "Stephan@3202"

common = xmlrpc.client.ServerProxy("{}/xmlrpc/2/common".format(url))
uid = common.authenticate(db, username, password, {})

models = xmlrpc.client.ServerProxy("{}/xmlrpc/2/object".format(url))

queries = ["Summit", "Tropicat", "Tropidog", "Tropi"]

for q in queries:
    products = models.execute_kw(db, uid, password, 'product.template', 'search_read', 
        [[['name', 'ilike', q], ['active', '=', True]]],
        {'fields': ['name', 'is_published'], 'limit': 10})
    print(f"\nProducts via name ilike '{q}':")
    for p in products:
        print(f"  - {p['name']} (published={p.get('is_published')})")
