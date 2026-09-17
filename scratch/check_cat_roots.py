import xmlrpc.client

url = "https://erp.stephanspetstore.co.tz"
db = "Stephans"
username = "info@stephanspetstore.co.tz"
password = "Stephan@3202"

common = xmlrpc.client.ServerProxy("{}/xmlrpc/2/common".format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy("{}/xmlrpc/2/object".format(url))

categories = models.execute_kw(db, uid, password, 'product.category', 'search_read', 
        [[]],
        {'fields': ['name', 'parent_id', 'complete_name']})

roots = [c for c in categories if not c.get('parent_id')]
print("Root categories:", [(r['id'], r['name']) for r in roots])

dogs = [c for c in categories if 'dog' in c['name'].lower()]
print("Dog categories:", [(d['id'], d['complete_name']) for d in dogs[:5]])
