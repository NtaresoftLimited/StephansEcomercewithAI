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

# Find first 100 products and check their image fields
products = models.execute_kw(db, uid, password, 'product.template', 'search_read', 
    [[]], 
    {'fields': ['id', 'name', 'image_1920', 'image_1024', 'image_512', 'image_256', 'image_128'], 'limit': 100}
)

found_image = False
for p in products:
    for field in ['image_1920', 'image_1024', 'image_512', 'image_256', 'image_128']:
        if p[field]:
            print(f"Product ID {p['id']} ('{p['name']}') HAS data in {field} (length: {len(str(p[field]))})")
            found_image = True
            break

if not found_image:
    print("NO products in the first 100 have ANY image data.")
