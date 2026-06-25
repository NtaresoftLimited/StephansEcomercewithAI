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
group_id = 23 # Accounting / Invoicing

print(f"Adding User {user_id} to Group {group_id}...")

try:
    models.execute_kw(db, uid, password, 'res.groups', 'write', [[group_id], {
        'users': [(4, user_id)] # 4 is the link operation in Odoo
    }])
    print("Successfully granted Invoicing access to Jonas M!")
except Exception as e:
    print(f"Error updating group: {e}")
