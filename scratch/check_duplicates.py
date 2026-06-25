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

# Search for products with similar names
names_to_check = ["Bioline Stain Remover", "Goat milk Calcium Tabs 165 Tabs", "Hoopet Wooven Cat Ball"]

for name in names_to_check:
    print(f"\nChecking duplicates for: '{name}'")
    products = models.execute_kw(db, uid, password, 'product.template', 'search_read', 
        [[('name', 'ilike', name)]], 
        {'fields': ['id', 'name', 'image_1920', 'categ_id']}
    )
    for p in products:
        has_image = bool(p['image_1920'])
        print(f"ID: {p['id']}, Name: '{p['name']}', Has Image: {has_image}, Category: {p['categ_id']}")

# Check if there are many products with image_1920 = False
no_image_count = models.execute_kw(db, uid, password, 'product.template', 'search_count', [[('image_1920', '=', False)]])
has_image_count = models.execute_kw(db, uid, password, 'product.template', 'search_count', [[('image_1920', '!=', False)]])
print(f"\nTotal Products: {no_image_count + has_image_count}")
print(f"Products with NO image: {no_image_count}")
print(f"Products WITH image: {has_image_count}")
