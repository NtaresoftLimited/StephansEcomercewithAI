import xmlrpc.client
import json

url = 'https://erp.stephanspetstore.co.tz'
db = 'Stephans'
username = 'info@stephanspetstore.co.tz'
password = 'Stephan@3202'

common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(url))

cats = models.execute_kw(db, uid, password, 'product.category', 'search_read',
    [[['complete_name', 'ilike', 'Feeder']]],
    {'fields': ['name', 'complete_name']})

print("Categories with 'Feeder':")
print(json.dumps(cats, indent=2))

products = models.execute_kw(db, uid, password, 'product.template', 'search_read',
    [[['categ_id', 'in', [c['id'] for c in cats]]]],
    {'fields': ['name', 'categ_id']})

print("Products in these categories:")
print(json.dumps(products[:5], indent=2))

