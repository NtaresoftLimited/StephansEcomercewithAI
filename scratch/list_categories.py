import xmlrpc.client

url = 'https://erp.stephanspetstore.co.tz'
db = 'Stephans'
username = 'info@stephanspetstore.co.tz'
password = 'Stephan@3202'

common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
uid = common.authenticate(db, username, password, {})

models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(url))

data = models.execute_kw(db, uid, password, 'product.public.category', 'search_read', [[]], {'fields': ['name', 'parent_id'], 'limit': 20})
print("Public:", data)

data = models.execute_kw(db, uid, password, 'product.category', 'search_read', [[['name', 'ilike', 'Cat']]], {'fields': ['name', 'parent_id'], 'limit': 20})
print("Internal Cats:", data)

data = models.execute_kw(db, uid, password, 'product.category', 'search_read', [[['name', 'ilike', 'Training']]], {'fields': ['name', 'parent_id'], 'limit': 20})
print("Internal Training:", data)
