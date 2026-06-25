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

# Search for products with images
ids_with_images = models.execute_kw(db, uid, password, 'product.template', 'search', [[('image_1920', '!=', False)]])
print(f"Total product IDs with images: {len(ids_with_images)}")
print(f"First 10 IDs: {ids_with_images[:10]}")

if ids_with_images:
    first_id = ids_with_images[0]
    p = models.execute_kw(db, uid, password, 'product.template', 'read', [[first_id]], {'fields': ['name', 'image_1920']})
    print(f"\nTesting ID {first_id} ('{p[0]['name']}'):")
    print(f"image_1920 type: {type(p[0]['image_1920'])}")
    print(f"image_1920 content: {p[0]['image_1920']}")
