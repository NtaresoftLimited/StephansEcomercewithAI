import xmlrpc.client
import json

url = 'https://erp.stephanspetstore.co.tz'
db = 'Stephans'
username = 'info@stephanspetstore.co.tz'
password = 'Stephan@3202'

common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(url))

# Fetch last 10 updated products
products = models.execute_kw(db, uid, password, 'product.template', 'search_read',
    [[]],
    {
        'fields': ['name', 'categ_id', 'write_date', 'list_price'],
        'order': 'write_date desc',
        'limit': 10
    })

print("LAST 10 UPDATED PRODUCTS IN ODOO:")
for p in products:
    cat_name = p['categ_id'][1] if p.get('categ_id') else 'No Category'
    print(f"- {p['name']} | Category: {cat_name} | Updated: {p['write_date']}")

