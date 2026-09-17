import xmlrpc.client
import urllib.request
import json
import os
import re

url = "https://erp.stephanspetstore.co.tz"
db = "Stephans"
username = "info@stephanspetstore.co.tz"
password = "Stephan@3202"

print("Authenticating with Odoo...")
common = xmlrpc.client.ServerProxy("{}/xmlrpc/2/common".format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy("{}/xmlrpc/2/object".format(url))

print("Fetching products from Odoo...")
odoo_products = models.execute_kw(db, uid, password, 'product.template', 'search_read', 
        [[['active', '=', True], ['sale_ok', '=', True], ['image_128', '!=', False]]],
        {'fields': ['name', 'categ_id']})

mismatches = []

def check_mismatch(name, cat_name, source):
    name_lower = name.lower()
    cat_lower = cat_name.lower()
    
    is_dog_product = ' dog' in name_lower or 'dog ' in name_lower or 'puppy' in name_lower or name_lower.startswith('dog')
    is_cat_product = ' cat' in name_lower or 'cat ' in name_lower or 'kitten' in name_lower or name_lower.startswith('cat')
    is_bird_product = 'bird' in name_lower or 'parrot' in name_lower
    is_small_product = 'hamster' in name_lower or 'rabbit' in name_lower or 'guinea pig' in name_lower
    
    is_dog_cat = 'dogs' in cat_lower
    is_cat_cat = 'cats' in cat_lower
    is_bird_cat = 'birds' in cat_lower
    is_small_cat = 'small animals' in cat_lower
    
    # Exceptions (e.g. products for both)
    if is_dog_product and is_cat_product:
        return
    
    if is_dog_product and is_cat_cat and not is_dog_cat:
        mismatches.append(f"[{source}] '{name}' is in category '{cat_name}'")
    elif is_cat_product and is_dog_cat and not is_cat_cat:
        mismatches.append(f"[{source}] '{name}' is in category '{cat_name}'")
    elif is_bird_product and not is_bird_cat and (is_dog_cat or is_cat_cat or is_small_cat):
        mismatches.append(f"[{source}] '{name}' is in category '{cat_name}'")
    elif is_small_product and not is_small_cat and (is_dog_cat or is_cat_cat or is_bird_cat):
        mismatches.append(f"[{source}] '{name}' is in category '{cat_name}'")

print("Analyzing Odoo products...")
for p in odoo_products:
    if p.get('categ_id'):
        cat_name = p['categ_id'][1]
        check_mismatch(p['name'], cat_name, "Odoo")

print(f"\nFound {len(mismatches)} potential mismatches in Odoo.")
for m in mismatches[:20]:
    print(m)
if len(mismatches) > 20:
    print(f"...and {len(mismatches) - 20} more.")
