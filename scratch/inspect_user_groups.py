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

user_id = 12 # Jonas M
user = models.execute_kw(db, uid, password, 'res.users', 'read', [user_id], {'fields': ['name', 'groups_id']})
print(f"User: {user[0]['name']}")
print(f"Groups: {user[0]['groups_id']}")

# List accounting related groups
groups = models.execute_kw(db, uid, password, 'res.groups', 'search_read', 
    [[('category_id.name', 'ilike', 'Accounting')]], 
    {'fields': ['display_name', 'name']}
)

print("\nAccounting Groups:")
for g in groups:
    print(f"ID: {g['id']}, Name: {g['display_name']}")
