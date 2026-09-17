import re
import json

with open("scratch/odoo_slugs.json") as f:
    odoo_slugs = json.load(f)

odoo_name_to_slug = {v.lower().strip().replace('  ', ' '): k for k, v in odoo_slugs.items()}

def get_odoo_slug(path_parts):
    # Fix top level
    animal = path_parts[0].lower()
    if animal == 'smallpets':
        animal = 'small animals'
    
    parts = [animal] + path_parts[1:]
    name_attempt = " / ".join(parts).lower()
    
    if name_attempt in odoo_name_to_slug:
        return odoo_name_to_slug[name_attempt]
        
    # Sometimes & has spaces differently, or spelling
    name_attempt2 = name_attempt.replace(" & ", " and ")
    if name_attempt2 in odoo_name_to_slug:
        return odoo_name_to_slug[name_attempt2]
        
    # Try finding exact match of the parts
    last_part = re.sub(r'[^a-z0-9]+', '-', parts[-1].lower()).strip('-')
    mid_part = re.sub(r'[^a-z0-9]+', '-', parts[1].lower()).strip('-') if len(parts) > 2 else ""
    
    for name, slug in odoo_name_to_slug.items():
        if slug.endswith(last_part) and parts[0] in name and mid_part in slug:
            return slug
            
    for name, slug in odoo_name_to_slug.items():
        if slug.endswith(last_part) and parts[0] in name:
            return slug
            
    return None

with open("lib/config/navigation.ts", "r", encoding="utf-8") as f:
    lines = f.readlines()

out_lines = []
current_animal = None
current_cat = None

for line in lines:
    # Check top level
    m_animal = re.match(r'^  ([a-zA-Z]+): \[', line)
    if m_animal:
        current_animal = m_animal.group(1)
    
    # Check category
    m_cat = re.search(r'title:\s*"([^"]+)"', line)
    if m_cat:
        current_cat = m_cat.group(1)
        
        # update the category href too
        if current_animal:
            slug = get_odoo_slug([current_animal, current_cat])
            if slug:
                # next line is usually href
                pass # handled below
    
    # Check category href
    m_cat_href = re.search(r'(href:\s*"/shop/)([^"]+)(")', line)
    if m_cat_href and not 'name:' in line and current_cat:
        slug = get_odoo_slug([current_animal, current_cat])
        if slug:
            line = line[:m_cat_href.start(2)] + slug + line[m_cat_href.end(2):]
            
    # Check item
    m_item = re.search(r'name:\s*"([^"]+)",\s*href:\s*"/shop/([^"]+)"', line)
    if m_item and current_animal and current_cat:
        item_name = m_item.group(1)
        old_slug = m_item.group(2)
        slug = get_odoo_slug([current_animal, current_cat, item_name])
        
        if slug:
            # Replace href
            line = re.sub(r'(href:\s*"/shop/)[^"]+(")', r'\g<1>' + slug + r'\g<2>', line)
        else:
            print(f"Warning: Could not find slug for {current_animal} -> {current_cat} -> {item_name}")

    out_lines.append(line)

with open("lib/config/navigation_new.ts", "w", encoding="utf-8") as f:
    f.writelines(out_lines)

print("Saved lib/config/navigation_new.ts")
