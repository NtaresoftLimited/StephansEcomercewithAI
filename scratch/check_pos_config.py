import xmlrpc.client
url = "https://erp.stephanspetstore.co.tz"
db = "Stephans"
username = "info@stephanspetstore.co.tz"
password = "Stephan@3202"

common = xmlrpc.client.ServerProxy("{}/xmlrpc/2/common".format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy("{}/xmlrpc/2/object".format(url))

fields = models.execute_kw(db, uid, password, 'pos.config', 'fields_get', [], {'attributes': ['string', 'type']})
for field, attrs in fields.items():
    if 'discount' in field.lower() or 'loyalty' in field.lower() or 'reward' in field.lower() or 'note' in field.lower() or 'order' in field.lower():
        print(field, attrs)
