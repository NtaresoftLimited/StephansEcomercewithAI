import xmlrpc.client
import os
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

# Odoo Credentials
url = os.getenv("ODOO_URL")
db = os.getenv("ODOO_DB")
username = os.getenv("ODOO_USER")
password = os.getenv("ODOO_PASSWORD")

file_path = r"C:\Users\fisto\Downloads\inventory_aligned.xlsx"

def sync_to_odoo():
    print("Connecting to Odoo...")
    common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common', allow_none=True)
    uid = common.authenticate(db, username, password, {})
    models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object', allow_none=True)
    print(f"Authenticated as UID: {uid}")

    print(f"Reading Excel file: {file_path}")
    df = pd.read_excel(file_path)
    
    # Pre-fetch categories to avoid repeated searches
    print("Fetching Odoo categories...")
    all_cats = models.execute_kw(db, uid, password, 'product.category', 'search_read', [[]], {'fields': ['id', 'name', 'parent_id']})
    cat_map = {} # (name, parent_id) -> id
    for c in all_cats:
        p_id = c['parent_id'][0] if c['parent_id'] else None
        cat_map[(c['name'], p_id)] = c['id']

    def get_or_create_category(name, parent_id=None):
        name = name.strip()
        if (name, parent_id) in cat_map:
            return cat_map[(name, parent_id)]
        
        # Search again just in case
        domain = [('name', '=', name), ('parent_id', '=', parent_id)]
            
        existing = models.execute_kw(db, uid, password, 'product.category', 'search', [domain])
        if existing:
            cat_id = existing[0]
        else:
            print(f"Creating category: {name} (parent: {parent_id})")
            cat_id = models.execute_kw(db, uid, password, 'product.category', 'create', [{
                'name': name,
                'parent_id': parent_id
            }])
        
        cat_map[(name, parent_id)] = cat_id
        return cat_id

    print("Starting product sync...")
    success_count = 0
    update_count = 0
    error_count = 0

    for index, row in df.iterrows():
        product_name = str(row['Product Name']).strip()
        if not product_name or product_name.lower() == 'nan':
            continue
            
        menu = str(row['Menu']).strip() if pd.notna(row['Menu']) else "Uncategorized"
        submenu = str(row['Submenu']).strip() if pd.notna(row['Submenu']) else None
        sub_submenu = str(row['Sub-submenu']).strip() if pd.notna(row['Sub-submenu']) else None

        try:
            # Build Category Hierarchy in Odoo
            root_cat_id = get_or_create_category(menu)
            current_cat_id = root_cat_id
            
            if submenu:
                current_cat_id = get_or_create_category(submenu, root_cat_id)
                if sub_submenu:
                    current_cat_id = get_or_create_category(sub_submenu, current_cat_id)

            # Check if product exists
            # We search by name. Strip whitespace in Odoo names too if possible.
            # But searching with '=' should be enough if we strip the input.
            existing_products = models.execute_kw(db, uid, password, 'product.template', 'search', [[('name', '=', product_name)]])

            if existing_products:
                # Update category if needed
                product_id = existing_products[0]
                models.execute_kw(db, uid, password, 'product.template', 'write', [[product_id], {
                    'categ_id': current_cat_id,
                    'type': 'consu' # Set as storable/consumable
                }])
                update_count += 1
                # print(f"[{index}] Updated: {product_name}")
            else:
                # Create new product
                models.execute_kw(db, uid, password, 'product.template', 'create', [{
                    'name': product_name,
                    'categ_id': current_cat_id,
                    'type': 'consu', # Consumable/Storable
                    'sale_ok': True,
                    'purchase_ok': True
                }])
                success_count += 1
                print(f"[{index}] Created: {product_name}")

        except Exception as e:
            print(f"Error processing row {index} ({product_name}): {e}")
            error_count += 1

    print("\nOdoo Sync Completed!")
    print(f"Created: {success_count}")
    print(f"Updated: {update_count}")
    print(f"Errors: {error_count}")

if __name__ == "__main__":
    sync_to_odoo()
