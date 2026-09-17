import xmlrpc.client

url = "https://erp.stephanspetstore.co.tz"
db = "Stephans"
username = "info@stephanspetstore.co.tz"
password = "Stephan@3202"

common = xmlrpc.client.ServerProxy("{}/xmlrpc/2/common".format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy("{}/xmlrpc/2/object".format(url))

categories = models.execute_kw(db, uid, password, 'product.category', 'search_read', [[['complete_name', 'ilike', 'Fountain']]], {'fields': ['complete_name']})
for c in categories:
    print(f"  {c['id']}: {c['complete_name']}")
