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

fields = models.execute_kw(db, uid, password, 'pos.config', 'fields_get', [], {'attributes': ['string', 'help', 'type']})

with open("scratch/pos_config_fields.txt", "w") as f:
    for field, data in fields.items():
        if 'receipt' in field.lower() or 'footer' in field.lower() or 'header' in field.lower() or 'custom' in field.lower():
            f.write(f"{field}: {data['type']} - {data.get('string', '')}\n")

print("Saved filtered fields to scratch/pos_config_fields.txt")
