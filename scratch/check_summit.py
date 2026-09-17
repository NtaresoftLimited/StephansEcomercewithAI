import xmlrpc.client

url = "https://erp.stephanspetstore.co.tz"
db = "Stephans"
username = "info@stephanspetstore.co.tz"
password = "Stephan@3202"

common = xmlrpc.client.ServerProxy("{}/xmlrpc/2/common".format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy("{}/xmlrpc/2/object".format(url))

products = models.execute_kw(db, uid, password, 'product.template', 'search_read', 
        [[['name', 'ilike', 'Summit 10']]],
        {'fields': ['name', 'image_1920', 'image_512']})
for p in products:
    has_image = bool(p.get('image_512') or p.get('image_1920'))
    print(f"  - {p['name']} (Has Image: {has_image})")
