import xmlrpc.client

url = "https://erp.stephanspetstore.co.tz"
db = "Stephans"
username = "info@stephanspetstore.co.tz"
password = "Stephan@3202"

common = xmlrpc.client.ServerProxy("{}/xmlrpc/2/common".format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy("{}/xmlrpc/2/object".format(url))

products = models.execute_kw(db, uid, password, 'product.template', 'search_read', 
        [[['name', 'in', ['Pet Water Fountain', 'Water Fountain Filter']]]],
        {'fields': ['name', 'categ_id']})

for p in products:
    print(f"  {p['name']} -> {p['categ_id'][1] if p['categ_id'] else 'None'}")
