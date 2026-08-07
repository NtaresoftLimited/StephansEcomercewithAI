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

pos_footer_text = """TIN: 137-033-089

ALL SALES ARE FINAL.
NO REFUNDS.
EXCHANGES WITH RECEIPT WITHIN 24 HRS"""

pos_configs = models.execute_kw(db, uid, password, 'pos.config', 'search', [[]])
if pos_configs:
    models.execute_kw(db, uid, password, 'pos.config', 'write', [pos_configs, {
        'receipt_footer': pos_footer_text,
        'receipt_header': ' ',  # Add a space to prevent null errors in custom receipt module
        'is_header_or_footer': True
    }])
    print(f"Updated {len(pos_configs)} POS configs with the new footer and empty header.")
