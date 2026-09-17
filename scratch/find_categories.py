import xmlrpc.client

url = 'https://erp.stephanspetstore.co.tz'
db = 'Stephans'
username = 'info@stephanspetstore.co.tz'
password = 'Stephan@3202'

common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
uid = common.authenticate(db, username, password, {})

models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(url))

def find_category(name):
    ids = models.execute_kw(db, uid, password, 'product.public.category', 'search', [[['name', 'ilike', name]]])
    if ids:
        data = models.execute_kw(db, uid, password, 'product.public.category', 'read', [ids], {'fields': ['name', 'parent_id']})
        return data
    return None

print("Training:", find_category('Training'))
print("Cats:", find_category('Cats'))
