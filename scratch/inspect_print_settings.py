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

print(f"Authenticated as UID: {uid}")

# Check POS Config
pos_configs = models.execute_kw(db, uid, password, 'pos.config', 'search_read', 
    [[('name', 'ilike', 'Masaki')]], 
    {'fields': ['name', 'module_pos_loyalty', 'loyalty_program_ids']}
)

print("\nPOS Configs:")
for pc in pos_configs:
    print(f"ID: {pc['id']}, Name: {pc['name']}, Loyalty enabled: {pc['module_pos_loyalty']}, Programs: {pc['loyalty_program_ids']}")

# Check Loyalty Program for print settings
program_id = 1 # "Gift Cards"
program = models.execute_kw(db, uid, password, 'loyalty.program', 'read', [program_id], 
    {'fields': ['name', 'mail_template_id', 'applies_on']}
)
print(f"\nProgram {program_id}: {program[0]}")

# Look for print-related fields in loyalty.program
fields = models.execute_kw(db, uid, password, 'loyalty.program', 'fields_get', [], {'attributes': ['string', 'help', 'type']})
print("\nLoyalty Program Fields (Print related):")
for f in fields:
    if 'print' in f or 'template' in f or 'report' in f:
        print(f"{f}: {fields[f]['string']}")
