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

view_id = 12533

with open("scratch/current_receipt.xml", "r", encoding="utf-8") as f:
    arch = f.read()

models.execute_kw(db, uid, password, 'ir.ui.view', 'write', [[view_id], {'arch': arch}])

print("Successfully updated Grooming Receipt template!")
