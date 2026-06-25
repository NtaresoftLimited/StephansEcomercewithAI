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

program_id = 1 # The "Gift Cards" program identified
rules_to_keep = [2] # Keeping the first rule
rules_to_delete = [3] # Deleting the extra rule

print(f"Fixing Loyalty Program ID: {program_id}")

try:
    # Delete the extra rule
    models.execute_kw(db, uid, password, 'loyalty.rule', 'unlink', [rules_to_delete])
    print(f"Successfully deleted extra rules: {rules_to_delete}")
except Exception as e:
    print(f"Error deleting rules: {e}")

# Verification
program = models.execute_kw(db, uid, password, 'loyalty.program', 'read', [program_id], {'fields': ['rule_ids']})
print(f"Updated Rules for Program {program_id}: {program[0]['rule_ids']}")
