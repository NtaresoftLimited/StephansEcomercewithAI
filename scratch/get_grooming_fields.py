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

fields = models.execute_kw(db, uid, password, 'grooming.appointment', 'fields_get', [], {'attributes': ['string', 'help', 'type']})

with open("scratch/grooming_fields.txt", "w") as f:
    for field, data in fields.items():
        f.write(f"{field}: {data['type']} - {data.get('string', '')}\n")

print("Saved fields to scratch/grooming_fields.txt")
