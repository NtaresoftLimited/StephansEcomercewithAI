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

views = models.execute_kw(db, uid, password, 'ir.ui.view', 'search_read', [[('arch', 'ilike', 'props.receipt.headerData.header')]], {'fields': ['name', 'key', 'arch']})

with open('scratch/pos_receipt_error_views.txt', 'w', encoding='utf-8') as f:
    for v in views:
        f.write(f"--- View: {v['name']} (Key: {v['key']}) ---\n")
        f.write(v['arch'])
        f.write("\n\n")

print(f"Found {len(views)} views.")
