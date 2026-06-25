import xmlrpc.client
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("ODOO_URL")
db = os.getenv("ODOO_DB")
username = os.getenv("ODOO_USER")
password = os.getenv("ODOO_PASSWORD")

common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, username, password, {})

models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')

# Fetch some categories
categories = models.execute_kw(db, uid, password, 'product.category', 'search_read', [[]], {'fields': ['name', 'parent_id'], 'limit': 20})
print("Categories:", categories)

# Fetch some products
products = models.execute_kw(db, uid, password, 'product.template', 'search_read', [[]], {'fields': ['name', 'categ_id'], 'limit': 5})
print("Products:", products)
