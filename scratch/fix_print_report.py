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
report_id = 2326 # "Gift Card" report

print(f"Setting Print Report {report_id} for Program {program_id}...")

try:
    models.execute_kw(db, uid, password, 'loyalty.program', 'write', [[program_id], {
        'pos_report_print_id': report_id
    }])
    print("Successfully updated the gift card program print report!")
except Exception as e:
    print(f"Error updating program: {e}")

# Verification
program = models.execute_kw(db, uid, password, 'loyalty.program', 'read', [program_id], {'fields': ['name', 'pos_report_print_id']})
print(f"Updated Program: {program[0]['name']}, Print Report: {program[0]['pos_report_print_id']}")
