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

line_ids = [583, 584]

print(f"Attempting to delete statement lines: {line_ids}...")

try:
    # Check if they are reconciled or part of a posted move
    # Statement lines in Odoo 17/18 are linked to account.move
    for line_id in line_ids:
        line = models.execute_kw(db, uid, password, 'account.bank.statement.line', 'read', [line_id], {'fields': ['move_id', 'is_reconciled']})
        move_id = line[0]['move_id'][0] if line[0]['move_id'] else None
        
        if line[0]['is_reconciled']:
            print(f"Line {line_id} is reconciled. Attempting to unreconcile...")
            # In Odoo, unreconciling is done on the move or the line
            # For statement lines, we might need to reset the move to draft
            if move_id:
                models.execute_kw(db, uid, password, 'account.move', 'button_draft', [[move_id]])
        
        # Now delete
        models.execute_kw(db, uid, password, 'account.bank.statement.line', 'unlink', [[line_id]])
        print(f"Successfully deleted line {line_id}")

except Exception as e:
    print(f"Error during deletion: {e}")
