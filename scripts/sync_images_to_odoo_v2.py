import xmlrpc.client
import os
import requests
import base64
import json
from dotenv import load_dotenv

load_dotenv()

# Odoo Credentials
url = os.getenv("ODOO_URL")
db = os.getenv("ODOO_DB")
username = os.getenv("ODOO_USER")
password = os.getenv("ODOO_PASSWORD")

# Sanity Credentials
project_id = os.getenv("NEXT_PUBLIC_SANITY_PROJECT_ID")
dataset = os.getenv("NEXT_PUBLIC_SANITY_DATASET", "production")
token = os.getenv("SANITY_API_WRITE_TOKEN")

common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common', allow_none=True)
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object', allow_none=True)

def fetch_sanity_products():
    sanity_url = f"https://{project_id}.api.sanity.io/v2023-05-03/data/query/{dataset}"
    query = '*[_type == "product" && defined(images[0])]{ _id, name, "imageUrl": images[0].asset->url }'
    params = {'query': query}
    headers = {'Authorization': f'Bearer {token}'}
    resp = requests.get(sanity_url, params=params, headers=headers)
    return resp.json()['result']

def sync_images():
    print("Fetching products from Sanity...")
    products = fetch_sanity_products()
    print(f"Found {len(products)} products with images in Sanity.")

    # Pre-fetch Odoo products that ALREADY have images to skip them
    print("Checking Odoo for existing images...")
    # Search for products with images (length > 100)
    # Actually, XML-RPC search doesn't support length easily.
    # We'll just read the image_1920 field for all IDs we are about to update.
    
    odoo_ids = []
    id_map = {}
    for p in products:
        try:
            oid = int(p['_id'].split('-')[-1])
            odoo_ids.append(oid)
            id_map[oid] = p
        except: continue

    # Batch read to check existing images
    batch_size = 100
    existing_images = {}
    for i in range(0, len(odoo_ids), batch_size):
        batch = odoo_ids[i:i+batch_size]
        res = models.execute_kw(db, uid, password, 'product.template', 'read', [batch], {'fields': ['image_1920']})
        for r in res:
            img = r.get('image_1920')
            if img and len(str(img)) > 100:
                existing_images[r['id']] = True

    print(f"Found {len(existing_images)} products already have images in Odoo. Skipping them.")

    success_count = 0
    skipped_count = 0
    error_count = 0

    for odoo_id in odoo_ids:
        if odoo_id in existing_images:
            skipped_count += 1
            continue

        p = id_map[odoo_id]
        try:
            # print(f"Processing ID {odoo_id} ({p['name']})...")

            # Download image
            img_resp = requests.get(p['imageUrl'], timeout=10)
            if img_resp.status_code == 200:
                img_base64 = base64.b64encode(img_resp.content).decode('utf-8')
                
                # Update Odoo
                models.execute_kw(db, uid, password, 'product.template', 'write', [[odoo_id], {
                    'image_1920': img_base64
                }])
                success_count += 1
                if success_count % 10 == 0:
                    print(f"Synced {success_count} images... (Skipped {skipped_count})")
            else:
                print(f"Failed to download image for {p['name']} (Status: {img_resp.status_code})")
                error_count += 1

        except Exception as e:
            print(f"Error processing {p['name']}: {e}")
            error_count += 1

    print(f"\nSync Completed!")
    print(f"Successfully synced: {success_count}")
    print(f"Skipped: {skipped_count}")
    print(f"Errors: {error_count}")

if __name__ == "__main__":
    sync_images()
