import xmlrpc.client
url = "https://erp.stephanspetstore.co.tz"
db = "Stephans"
username = "info@stephanspetstore.co.tz"
password = "Stephan@3202"

common = xmlrpc.client.ServerProxy("{}/xmlrpc/2/common".format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy("{}/xmlrpc/2/object".format(url))

cats = models.execute_kw(db, uid, password, 'product.category', 'search_read', 
        [[['name', 'ilike', 'Elevated']]],
        {'fields': ['id', 'name', 'complete_name']})
for c in cats: print("Category:", c)

products = models.execute_kw(db, uid, password, 'product.template', 'search_read', 
        [[['name', 'ilike', 'Elevated']]],
        {'fields': ['name', 'qty_available', 'active', 'sale_ok', 'categ_id']})
for p in products: print("Product:", p)

products_in_cat = models.execute_kw(db, uid, password, 'product.template', 'search_read', 
        [[['categ_id.name', 'ilike', 'Elevated']]],
        {'fields': ['name', 'qty_available', 'active', 'sale_ok', 'categ_id']})
for p in products_in_cat: print("Product In Cat:", p)
