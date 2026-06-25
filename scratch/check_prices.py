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

# Fetch some products with price
products = models.execute_kw(db, uid, password, 'product.template', 'search_read', [[]], {'fields': ['name', 'list_price'], 'limit': 10})
for p in products:
    print(f"Product: {p['name']}, Price: {p['list_price']}")
