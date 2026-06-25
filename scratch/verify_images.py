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

# Fetch products that have some image data
products = models.execute_kw(db, uid, password, 'product.template', 'search_read', 
    [[('image_1920', '!=', False)]], 
    {'fields': ['id', 'name', 'image_1920', 'image_128'], 'limit': 10}
)

print(f"Checking images for {len(products)} products...")
for p in products:
    img_1920_len = len(str(p['image_1920'])) if p['image_1920'] else 0
    img_128_len = len(str(p['image_128'])) if p['image_128'] else 0
    print(f"ID: {p['id']}, Name: {p['name']}, image_1920 length: {img_1920_len}, image_128 length: {img_128_len}")

# If image_128 is 0 but image_1920 is not, Odoo might not be generating thumbnails.
