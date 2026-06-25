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
products_with_images = models.execute_kw(db, uid, password, 'product.template', 'search_read', 
    [[('image_1920', '!=', False)]], 
    {'fields': ['id', 'name', 'categ_id']}
)

print(f"Found {len(products_with_images)} products with images.")

# Map normalized name -> ID
image_map = {}
for p in products_with_images:
    norm_name = p['name'].strip().lower()
    if norm_name not in image_map:
        image_map[norm_name] = []
    image_map[norm_name].append(p)

# Find products I created (high IDs) that have NO image
new_products = models.execute_kw(db, uid, password, 'product.template', 'search_read', 
    [[('id', '>', 2500), ('image_1920', '=', False)]], 
    {'fields': ['id', 'name', 'categ_id']}
)

print(f"Found {len(new_products)} new products with no images.")

merge_tasks = []
for np in new_products:
    norm_name = np['name'].strip().lower()
    if norm_name in image_map:
        for original in image_map[norm_name]:
            merge_tasks.append((np, original))

print(f"\nPotential Merges (New product category -> Original product with image): {len(merge_tasks)}")
for np, orig in merge_tasks[:5]:
    print(f"New ID {np['id']} ('{np['name']}') -> Original ID {orig['id']} ('{orig['name']}')")
