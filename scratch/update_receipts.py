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

# 1. Update POS Configs
pos_footer_text = """ALL SALES ARE FINAL.
NO REFUNDS.
EXCHANGES WITH RECEIPT WITHIN 24 HRS"""

# Check if receipt_footer field exists and update
pos_configs = models.execute_kw(db, uid, password, 'pos.config', 'search', [[]])
if pos_configs:
    models.execute_kw(db, uid, password, 'pos.config', 'write', [pos_configs, {
        'receipt_footer': pos_footer_text,
        'is_header_or_footer': True  # Make sure custom header/footer is enabled
    }])
    print(f"Updated {len(pos_configs)} POS configs with the new footer.")

# 2. Update Grooming Receipt Template
view_id = 12533
with open("scratch/current_receipt.xml", "r", encoding="utf-8") as f:
    arch = f.read()

# Remove the old return policy from grooming receipt
old_text = '<p style="margin-top: 5px;"><strong>No return policy after 24 hrs</strong></p>'
if old_text in arch:
    arch = arch.replace(old_text, '')
    
    # Save it back locally just in case
    with open("scratch/current_receipt.xml", "w", encoding="utf-8") as f:
        f.write(arch)
        
    models.execute_kw(db, uid, password, 'ir.ui.view', 'write', [[view_id], {'arch': arch}])
    print("Successfully updated Grooming Receipt template!")
else:
    print("Return policy text not found in Grooming Receipt template.")
