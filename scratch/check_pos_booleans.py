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
for f, a in fields.items():
    if a.get('type') == 'boolean':
        print(f, "-->", a.get('string'))
