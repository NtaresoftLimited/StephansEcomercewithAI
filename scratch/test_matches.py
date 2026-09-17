import json

with open("scratch/odoo_slugs.json") as f:
    odoo_slugs = json.load(f)

for category in ['feeders', 'wet-food', 'beds']:
    t = category[:-1] if category.endswith('s') else category
    matches = [s for s in odoo_slugs if t in s]
    print(f"\nURL /shop/{category} (t='{t}') matches:")
    for m in matches:
        print(f"  - {m} ({odoo_slugs[m]})")
