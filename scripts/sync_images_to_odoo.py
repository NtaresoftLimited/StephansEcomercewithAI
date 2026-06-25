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

    success_count = 0
    error_count = 0

    for p in products:
        # Extract Odoo ID from _id (e.g. odoo-123)
        try:
            if '-' in p['_id']:
                odoo_id_str = p['_id'].split('-')[-1]
                if not odoo_id_str.isdigit(): continue
                odoo_id = int(odoo_id_str)
            else:
                continue

            print(f"Processing ID {odoo_id} ({p['name']})...")

            # Download image
            img_resp = requests.get(p['imageUrl'])
            if img_resp.status_code == 200:
                img_base64 = base64.b64encode(img_resp.content).decode('utf-8')
                
                # Update Odoo
                models.execute_kw(db, uid, password, 'product.template', 'write', [[odoo_id], {
                    'image_1920': img_base64
                }])
                success_count += 1
            else:
                print(f"Failed to download image for {p['name']}")
                error_count += 1

        except Exception as e:
            print(f"Error processing {p['name']}: {e}")
            error_count += 1

        if success_count % 50 == 0 and success_count > 0:
            print(f"Synced {success_count} images...")

    print(f"\nSync Completed!")
    print(f"Successfully synced: {success_count}")
    print(f"Errors: {error_count}")

if __name__ == "__main__":
    sync_images()
