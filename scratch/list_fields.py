import xmlrpc.client
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("ODOO_URL")
db = os.getenv("ODOO_DB")
username = os.getenv("ODOO_USER")
password = os.getenv("ODOO_PASSWORD")

common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common', allow_none=True)
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object', allow_none=True)

# List fields for pos.config
pos_fields = models.execute_kw(db, uid, password, 'pos.config', 'fields_get', [], {'attributes': ['string']})
print("POS Config Fields (loyalty related):")
for f in pos_fields:
    if 'loyalty' in f or 'gift' in f:
        print(f"{f}: {pos_fields[f]['string']}")

# List fields for loyalty.program
loyalty_fields = models.execute_kw(db, uid, password, 'loyalty.program', 'fields_get', [], {'attributes': ['string']})
print("\nLoyalty Program Fields (print related):")
for f in loyalty_fields:
    if 'print' in f or 'report' in f or 'template' in f:
        print(f"{f}: {loyalty_fields[f]['string']}")
