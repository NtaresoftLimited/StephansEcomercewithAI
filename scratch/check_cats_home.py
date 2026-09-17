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
    [[['complete_name', 'ilike', 'CATS']]],
    {'fields': ['name', 'complete_name', 'parent_id']})

print(json.dumps([c for c in cats if 'Home' in c['complete_name'] or 'HOME' in c['complete_name']], indent=2))
