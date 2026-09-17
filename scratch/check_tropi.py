import xmlrpc.client

url = "https://erp.stephanspetstore.co.tz"
db = "Stephans"
username = "info@stephanspetstore.co.tz"
password = "Stephan@3202"

common = xmlrpc.client.ServerProxy("{}/xmlrpc/2/common".format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy("{}/xmlrpc/2/object".format(url))

# Let's see if Tropidog or Tropicat is in categories
cats = models.execute_kw(db, uid, password, 'product.category', 'search_read', 
        [[['name', 'ilike', 'tropi']]],
        {'fields': ['name', 'complete_name']})
print("Categories with 'tropi':", cats)

# Let's search for products without the active=True to see if they are archived
all_tropicat = models.execute_kw(db, uid, password, 'product.template', 'search_read', 
        [[['name', 'ilike', 'tropicat']]],
        {'fields': ['name']})
print("All Tropicat products (including inactive):", all_tropicat)
