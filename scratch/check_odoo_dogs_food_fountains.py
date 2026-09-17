import xmlrpc.client
url = "https://erp.stephanspetstore.co.tz"
db = "Stephans"
username = "info@stephanspetstore.co.tz"
password = "Stephan@3202"

common = xmlrpc.client.ServerProxy("{}/xmlrpc/2/common".format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy("{}/xmlrpc/2/object".format(url))

cats = models.execute_kw(db, uid, password, 'product.category', 'search_read', 
        [[['complete_name', 'ilike', 'DOGS / FOOD / Water Fountains']]],
        {'fields': ['id', 'name', 'complete_name', 'parent_id']})
for c in cats: print(c)
