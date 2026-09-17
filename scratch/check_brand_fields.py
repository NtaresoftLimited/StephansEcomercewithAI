import xmlrpc.client

url = "https://erp.stephanspetstore.co.tz"
db = "Stephans"
username = "info@stephanspetstore.co.tz"
password = "Stephan@3202"

common = xmlrpc.client.ServerProxy("{}/xmlrpc/2/common".format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy("{}/xmlrpc/2/object".format(url))

fields = models.execute_kw(db, uid, password, 'product.template', 'fields_get', [], {'attributes': ['string', 'type']})

brand_fields = {k: v for k, v in fields.items() if 'brand' in k.lower() or 'brand' in v['string'].lower()}
print("Brand-related fields in product.template:")
for k, v in brand_fields.items():
    print(f"  {k}: {v}")
