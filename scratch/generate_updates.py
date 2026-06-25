import pandas as pd
import json
import re

file_path = r"C:\Users\fisto\Downloads\inventory_aligned.xlsx"
df = pd.read_excel(file_path)

def slugify(text):
    if not text or pd.isna(text): return ""
    text = str(text).lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

category_mapping = {
    "SHOP FOR DOG": "dogs",
    "SHOP FOR CAT": "cats",
    "SHOP FOR BIRDS": "birds",
    "SHOP FOR SMALL PETS": "small-pets"
}

results = []

for _, row in df.iterrows():
    name = str(row['Product Name']).strip()
    if not name or name.lower() == 'nan': continue
    
    menu = str(row['Menu']).strip() if pd.notna(row['Menu']) else ""
    submenu = str(row['Submenu']).strip() if pd.notna(row['Submenu']) else ""
    sub_submenu = str(row['Sub-submenu']).strip() if pd.notna(row['Sub-submenu']) else ""
    
    # Determine the target category slug
    # We want the deepest available category.
    target_slug = ""
    if sub_submenu:
        target_slug = slugify(sub_submenu)
    elif submenu:
        target_slug = slugify(submenu)
    elif menu:
        target_slug = category_mapping.get(menu, slugify(menu))
    
    if target_slug:
        results.append({
            "name": name,
            "categorySlug": target_slug
        })

with open('scratch/product_category_updates.json', 'w') as f:
    json.dump(results, f, indent=2)

print(f"Generated {len(results)} updates in scratch/product_category_updates.json")
