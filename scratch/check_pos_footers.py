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

pos_configs = models.execute_kw(db, uid, password, 'pos.config', 'search_read', [[]], {'fields': ['name', 'receipt_footer']})
for config in pos_configs:
    print(f"--- Config: {config['name']} ---")
    print(config['receipt_footer'])
