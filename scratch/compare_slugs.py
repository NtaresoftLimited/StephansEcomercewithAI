import json
import re

with open("scratch/odoo_slugs.json") as f:
    odoo_slugs = json.load(f)

with open("lib/config/navigation.ts", "r") as f:
    nav = f.read()

# find all href="/shop/..."
hrefs = re.findall(r'href:\s*"/shop/([^"]+)"', nav)

print(f"Total hrefs in navigation: {len(hrefs)}")
missing = []
for h in hrefs:
    # check if 'h' matches any odoo slug exactly
    if h not in odoo_slugs:
        # maybe it matches the end of a slug?
        matches = [s for s in odoo_slugs if s.endswith(h)]
        if not matches:
            missing.append(h)

print(f"Hrefs not matching any Odoo slug exactly or by suffix: {len(missing)}")
print("Sample missing:", missing[:10])
