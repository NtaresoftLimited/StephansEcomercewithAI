import xmlrpc.client
import json
url = "https://erp.stephanspetstore.co.tz"
db = "Stephans"
username = "info@stephanspetstore.co.tz"
password = "Stephan@3202"

common = xmlrpc.client.ServerProxy("{}/xmlrpc/2/common".format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy("{}/xmlrpc/2/object".format(url))

fields = models.execute_kw(db, uid, password, 'pos.config', 'fields_get', [], {'attributes': ['string', 'type']})
print("ALL FIELDS COUNT:", len(fields))
for f, a in fields.items():
    s = a.get('string', '').lower()
    if 'discount' in f.lower() or 'loyalty' in f.lower() or 'reward' in f.lower() or 'note' in f.lower() or 'quotation' in f.lower() or 'customer' in f.lower() or 'code' in f.lower():
        print(f, "-->", a)
