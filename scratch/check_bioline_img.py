import xmlrpc.client

url = "https://erp.stephanspetstore.co.tz"
db = "Stephans"
username = "info@stephanspetstore.co.tz"
password = "Stephan@3202"

common = xmlrpc.client.ServerProxy("{}/xmlrpc/2/common".format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy("{}/xmlrpc/2/object".format(url))

products = models.execute_kw(db, uid, password, 'product.template', 'search_read', 
        [[['name', 'ilike', 'Bioline']]],
        {'fields': ['name', 'image_128']})
for p in products[:5]:
    has_image = bool(p.get('image_128'))
    print(f"  - {p['name']} (Has image_128: {has_image})")
