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

# Search for bank statement lines by payment_ref or label
search_terms = ['POS/00411-out-LUNCH', 'POS/00411-out-fiston tet']

print("Searching for transactions...")
for term in search_terms:
    lines = models.execute_kw(db, uid, password, 'account.bank.statement.line', 'search_read', 
        [[('payment_ref', 'ilike', term)]], 
        {'fields': ['id', 'payment_ref', 'amount', 'date']}
    )
    
    if not lines:
        # Try searching in account.move if not found in statement lines
        lines = models.execute_kw(db, uid, password, 'account.move', 'search_read', 
            [[('ref', 'ilike', term)]], 
            {'fields': ['id', 'ref', 'name', 'amount_total', 'state']}
        )
        print(f"Found in account.move for '{term}': {lines}")
    else:
        print(f"Found in account.bank.statement.line for '{term}': {lines}")

# I will delete them after confirming they exist.
