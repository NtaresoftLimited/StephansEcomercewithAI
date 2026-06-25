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

# Fetch data again to be safe
products_with_images = models.execute_kw(db, uid, password, 'product.template', 'search_read', 
    [[('image_1920', '!=', False)]], 
    {'fields': ['id', 'name', 'categ_id']}
)
image_map = {}
for p in products_with_images:
    norm_name = p['name'].strip().lower()
    if norm_name not in image_map:
        image_map[norm_name] = p

new_products = models.execute_kw(db, uid, password, 'product.template', 'search_read', 
    [[('id', '>', 2500), ('image_1920', '=', False)]], 
    {'fields': ['id', 'name', 'categ_id']}
)

print(f"Starting merge/cleanup of {len(new_products)} potential duplicates...")

processed_count = 0
deleted_count = 0

for np in new_products:
    norm_name = np['name'].strip().lower()
    if norm_name in image_map:
        original = image_map[norm_name]
        
        try:
            # 1. Update original product with the new category and trimmed name
            models.execute_kw(db, uid, password, 'product.template', 'write', [[original['id']], {
                'categ_id': np['categ_id'][0],
                'name': np['name'].strip() # Use the clean name
            }])
            
            # 2. Delete the new duplicate product
            models.execute_kw(db, uid, password, 'product.template', 'unlink', [[np['id']]])
            
            processed_count += 1
            if processed_count % 20 == 0:
                print(f"Processed {processed_count} products...")
                
        except Exception as e:
            print(f"Error merging ID {np['id']} into {original['id']}: {e}")

print(f"\nMerge Completed!")
print(f"Merged and cleaned: {processed_count}")
