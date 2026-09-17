import xmlrpc.client
import json

url = 'https://erp.stephanspetstore.co.tz'
db = 'Stephans'
username = 'info@stephanspetstore.co.tz'
password = 'Stephan@3202'

common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(url))

dogs = models.execute_kw(db, uid, password, 'product.category', 'search_read',
    [[['complete_name', 'ilike', 'DOGS /']]],
    {'fields': ['name', 'complete_name', 'parent_id']})

print(json.dumps([d for d in dogs if 'Groom' in d['complete_name'] or 'GROOM' in d['complete_name']], indent=2))
