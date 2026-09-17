import xmlrpc.client
import json
import re

url = 'https://erp.stephanspetstore.co.tz'
db = 'Stephans'
username = 'info@stephanspetstore.co.tz'
password = 'Stephan@3202'

common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(url))

cats = models.execute_kw(db, uid, password, 'product.category', 'search_read',
    [[]],
    {'fields': ['name', 'complete_name']})

slugs = {}
for c in cats:
    # Logic from page.tsx:
    # (cat.display_name || cat.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    complete_name = c['complete_name']
    slug = re.sub(r'[^a-z0-9]+', '-', complete_name.lower()).strip('-')
    slugs[slug] = complete_name

with open("scratch/odoo_slugs.json", "w") as f:
    json.dump(slugs, f, indent=2)
print("Saved odoo_slugs.json")
