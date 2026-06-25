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

program_id = 1 # "Gift Cards"
program = models.execute_kw(db, uid, password, 'loyalty.program', 'read', [program_id], {'fields': ['name', 'pos_report_print_id']})
print(f"Program: {program[0]['name']}, Print Report: {program[0]['pos_report_print_id']}")

# If Print Report is False, we need to set it to a valid report.
# Usually, Odoo has a default report for gift cards: 'loyalty.gift_card_report' or similar.
# Let's search for available reports.
reports = models.execute_kw(db, uid, password, 'ir.actions.report', 'search_read', 
    [[('model', '=', 'loyalty.card')]], 
    {'fields': ['name', 'report_name', 'xml_id']}
)
print("\nAvailable reports for loyalty.card:")
for r in reports:
    print(r)
