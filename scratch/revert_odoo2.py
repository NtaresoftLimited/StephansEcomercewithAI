import xmlrpc.client

url = "https://erp.stephanspetstore.co.tz"
db = "Stephans"
username = "info@stephanspetstore.co.tz"
password = "Stephan@3202"

common = xmlrpc.client.ServerProxy("{}/xmlrpc/2/common".format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy("{}/xmlrpc/2/object".format(url))

all_categories = models.execute_kw(db, uid, password, 'product.category', 'search_read', [[]], {'fields': ['name', 'complete_name']})
cat_map = {c['complete_name']: c['id'] for c in all_categories}

def find_cat(name_str):
    if name_str in cat_map:
        return cat_map[name_str]
    for c_name, c_id in cat_map.items():
        if name_str in c_name:
            return c_id
    return None

reverts = {
    'Cat Handling Glove L': 'DOGS / TRAINING & BEHAVIOR / Handling Gloves',
    'Cat Handling Glove S, M': 'DOGS / TRAINING & BEHAVIOR / Handling Gloves',
    'Catya Collar USB Large': 'DOGS / COLLARS, HARNESSES & LEADS / Collars',
    'Catya Collar USB Medium': 'DOGS / COLLARS, HARNESSES & LEADS / Collars',
    'Cotton and; Canvas Dog Carrier': 'CATS / Home and Crates / Traveling Essentials',
    'Dog Fabric Cooling Mat XL': 'CATS / BEDS & COMFORT / Mats & pads',
    'Dog Food Measuring Spoon 250ml/5-800g': 'CATS / BOWLS & FEEDERS / Food Bowls',
    'Face Cat harness and Leash L': 'DOGS / COLLARS, HARNESSES & LEADS / Harnesses',
    'Face Cat harness and Leash S': 'DOGS / COLLARS, HARNESSES & LEADS / Harnesses',
    'Furry Cat Head Warmer': 'DOGS / PET APPAREL / Fashion Accessories',
    'HipiDog Dog Hello Bear Clothe': 'CATS / PET APPAREL / Costumes & Dress-Up',
    'LED Light Leash Large Catya': 'DOGS / COLLARS, HARNESSES & LEADS / Collars',
    'Pakeaway Cat Feed Bowl': 'DOGS / BOWLS & FEEDERS / Elevated Bowls',
    'Round Ear Shape Cat Bed': 'DOGS / BEDS & COMFORT / Beds',
    'Sunflower Cat Bed': 'DOGS / BEDS & COMFORT / Beds',
    'V shaped  Cat House ': 'DOGS / BEDS & COMFORT / Beds'
}

products = models.execute_kw(db, uid, password, 'product.template', 'search_read', 
        [[['name', 'in', list(reverts.keys())]]],
        {'fields': ['name', 'categ_id']})

print("Reverting changes in Odoo...")
for p in products:
    target_name = reverts[p['name']]
    target_id = find_cat(target_name)
    if target_id:
        models.execute_kw(db, uid, password, 'product.template', 'write', [[p['id']], {'categ_id': target_id}])
        print(f"Reverted {p['name']} back to {target_name}")
    else:
        print(f"Failed to find category {target_name} for {p['name']}")
