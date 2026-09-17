import xmlrpc.client
import json

url = 'https://erp.stephanspetstore.co.tz'
db = 'Stephans'
username = 'info@stephanspetstore.co.tz'
password = 'Stephan@3202'

common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(url))

new_categories = [
    {'name': 'Barriers & Gates', 'parent_id': 1322},
    {'name': 'Ear Care', 'parent_id': 1241},
    {'name': 'Eye Care', 'parent_id': 1241},
    {'name': 'Ear Care', 'parent_id': 1156},
    {'name': 'Eye Care', 'parent_id': 1156}
]

created = []
for cat in new_categories:
    try:
        cat_id = models.execute_kw(db, uid, password, 'product.category', 'create', [cat])
        created.append({'id': cat_id, 'name': cat['name'], 'parent_id': cat['parent_id']})
        print(f"Created {cat['name']} under {cat['parent_id']} with ID {cat_id}")
    except Exception as e:
        print(f"Failed to create {cat['name']}: {e}")

print("All done.")
