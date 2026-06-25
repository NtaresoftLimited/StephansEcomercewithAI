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

# Search for loyalty programs related to Gift Cards
programs = models.execute_kw(db, uid, password, 'loyalty.program', 'search_read', 
    [[('program_type', '=', 'gift_card')]], 
    {'fields': ['name', 'program_type', 'rule_ids', 'reward_ids']}
)

print("\nGift Card Programs:")
for p in programs:
    print(f"ID: {p['id']}, Name: {p['name']}, Rules: {p['rule_ids']}, Rewards: {p['reward_ids']}")
    
    # Check rules
    if p['rule_ids']:
        rules = models.execute_kw(db, uid, password, 'loyalty.rule', 'read', [p['rule_ids']], {'fields': ['code']})
        print(f"  Rules: {rules}")
    
    # Check rewards
    if p['reward_ids']:
        rewards = models.execute_kw(db, uid, password, 'loyalty.reward', 'read', [p['reward_ids']], {'fields': ['reward_type']})
        print(f"  Rewards: {rewards}")

# If we find more than one rule or reward in a gift card program, we might need to delete the extras.
