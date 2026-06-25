import pandas as pd
import json

file_path = r"C:\Users\fisto\Downloads\inventory_aligned.xlsx"
df = pd.read_excel(file_path)

# Fill NaNs
df['Menu'] = df['Menu'].fillna('Uncategorized')
df['Submenu'] = df['Submenu'].fillna('General')
df['Sub-submenu'] = df['Sub-submenu'].fillna('')

taxonomy = {}

for _, row in df.iterrows():
    menu = str(row['Menu']).strip()
    submenu = str(row['Submenu']).strip()
    sub_submenu = str(row['Sub-submenu']).strip()
    
    if menu not in taxonomy:
        taxonomy[menu] = {}
    
    if submenu not in taxonomy[menu]:
        taxonomy[menu][submenu] = set()
    
    if sub_submenu:
        taxonomy[menu][submenu].add(sub_submenu)

# Convert sets to sorted lists for JSON
final_taxonomy = []
for menu, submenus in taxonomy.items():
    menu_node = {"name": menu, "children": []}
    for submenu, sub_submenus in submenus.items():
        submenu_node = {"name": submenu, "children": sorted(list(sub_submenus))}
        menu_node["children"].append(submenu_node)
    final_taxonomy.append(menu_node)

print(json.dumps(final_taxonomy, indent=2))
