import re
import json

with open("scratch/odoo_slugs.json") as f:
    odoo_slugs = json.load(f)

# Create a reverse mapping: complete_name (lowercase, stripped) -> slug
odoo_name_to_slug = {v.lower().strip(): k for k, v in odoo_slugs.items()}

# We also want a fuzzy matcher in case of slight spelling differences
def get_odoo_slug(path_parts):
    # e.g. path_parts = ["DOGS", "Food", "Adult Dog Food"]
    name_attempt = " / ".join(path_parts).lower()
    if name_attempt in odoo_name_to_slug:
        return odoo_name_to_slug[name_attempt]
    
    # Try singular/plural or other minor fixes
    # In Odoo, dogs -> DOGS, cats -> CATS, birds -> BIRDS, smallPets -> SMALL ANIMALS
    if path_parts[0] == 'smallpets':
        path_parts[0] = 'small animals'
    
    name_attempt = " / ".join(path_parts).lower()
    if name_attempt in odoo_name_to_slug:
        return odoo_name_to_slug[name_attempt]
    
    # Fallback: search for a slug that ends with the last part
    last_part_slug = re.sub(r'[^a-z0-9]+', '-', path_parts[-1].lower()).strip('-')
    for name, slug in odoo_name_to_slug.items():
        if slug.endswith(last_part_slug) and path_parts[0].lower() in name:
            return slug
    
    return None

print(get_odoo_slug(["BIRDS", "Bowls & Feeders", "Feeders"]))
print(get_odoo_slug(["CATS", "Bowls & Feeders", "Food Bowls"]))
