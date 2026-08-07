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

pos_configs = models.execute_kw(db, uid, password, 'pos.config', 'search_read', [[]], {'fields': ['name', 'design_receipt']})

updated_count = 0
for config in pos_configs:
    xml = config.get('design_receipt', '')
    if xml and 'props.receipt.headerData.header' in xml:
        # Fix the unsafe access that crashes when headerData is undefined
        new_xml = xml.replace(
            '<t t-if="props.receipt.headerData.header">', 
            '<t t-if="props.receipt.headerData and props.receipt.headerData.header">'
        )
        # Just in case they also use props.receipt.header directly:
        new_xml = new_xml.replace(
            '<t t-esc="props.receipt.headerData.header" />',
            '<t t-esc="props.receipt.headerData.header" />'
        )
        
        models.execute_kw(db, uid, password, 'pos.config', 'write', [[config['id']], {'design_receipt': new_xml}])
        updated_count += 1
        print(f"Patched XML for {config['name']}")

print(f"Updated {updated_count} POS configs.")
