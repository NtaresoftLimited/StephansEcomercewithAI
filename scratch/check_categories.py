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

from collections import Counter
names = [c['complete_name'] for c in categories]
duplicates = [item for item, count in Counter(names).items() if count > 1]
print("Duplicate Complete Names:", duplicates)

# Let's also check for categories with the same 'name' under the same parent
parent_name_combos = [(c.get('parent_id') and c['parent_id'][1] or 'None', c['name']) for c in categories]
dup_combos = [item for item, count in Counter(parent_name_combos).items() if count > 1]
print("Duplicate (Parent, Name) Combos:", dup_combos)
