import xmlrpc.client
import json

url = 'https://erp.stephanspetstore.co.tz'
db = 'Stephans'
username = 'info@stephanspetstore.co.tz'
password = 'Stephan@3202'

common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
uid = common.authenticate(db, username, password, {})

models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(url))

def find_category(name):
    return models.execute_kw(db, uid, password, 'product.category', 'search_read',
        [[['name', 'ilike', name]]],
        {'fields': ['name', 'complete_name', 'parent_id']})

cats_home = find_category('Home & Crates')
grooming = find_category('Grooming Essentials')
ear = find_category('Ear Care')
eye = find_category('Eye Care')
barriers = find_category('Barriers & Gates')

print("Home & Crates:", json.dumps(cats_home, indent=2))
print("Grooming Essentials:", json.dumps(grooming, indent=2))
print("Ear Care:", json.dumps(ear, indent=2))
print("Eye Care:", json.dumps(eye, indent=2))
print("Barriers & Gates:", json.dumps(barriers, indent=2))
