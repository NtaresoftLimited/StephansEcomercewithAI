import xmlrpc.client

url = "https://erp.stephanspetstore.co.tz"
db = "Stephans"
username = "info@stephanspetstore.co.tz"
password = "Stephan@3202"

common = xmlrpc.client.ServerProxy("{}/xmlrpc/2/common".format(url))
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy("{}/xmlrpc/2/object".format(url))

odoo_products = models.execute_kw(db, uid, password, 'product.template', 'search_read', 
        [[['active', '=', True], ['sale_ok', '=', True], ['image_128', '!=', False]]],
        {'fields': ['name', 'categ_id']})

all_categories = models.execute_kw(db, uid, password, 'product.category', 'search_read', 
        [[]],
        {'fields': ['name', 'complete_name']})

cat_map = {c['complete_name']: c['id'] for c in all_categories}

mismatches_to_fix = {
    'Bioline Keep Off Spray For Cats 175ml': 'All / CATS / Home and Crates / Traveling Essentials',
    'Cat Handling Glove L': 'All / CATS / CAT TOYS / Interactive Toys',
    'Cat Handling Glove S, M': 'All / CATS / CAT TOYS / Interactive Toys',
    'Catya Collar USB Large': 'All / CATS / COLLARS, HARNESSES & LEADS / Collars',
    'Catya Collar USB Medium': 'All / CATS / COLLARS, HARNESSES & LEADS / Collars',
    'Cotton and; Canvas Dog Carrier': 'All/Dog/Home & Nest/Cage',
    'Dog Fabric Cooling Mat XL': 'All / DOGS / BEDS & COMFORT / Mats & Pads',
    'Dog Food Measuring Spoon 250ml/5-800g': 'All / DOGS / BOWLS & FEEDERS / Food Bowls',
    'Face Cat harness and Leash L': 'All / CATS / COLLARS, HARNESSES & LEADS / Harnesses',
    'Face Cat harness and Leash S': 'All / CATS / COLLARS, HARNESSES & LEADS / Harnesses',
    'Furry Cat Head Warmer': 'All / CATS / PET APPAREL / Fashion Accessories',
    'HipiDog Dog Hello Bear Clothe': 'All / DOGS / PET APPAREL / Costumes & Dress-Up',
    'LED Light Leash Large Catya': 'All / CATS / COLLARS, HARNESSES & LEADS / Leads',
    'Pakeaway Cat Feed Bowl': 'All / CATS / BOWLS & FEEDERS / Food Bowls',
    'Round Ear Shape Cat Bed': 'All / CATS / BEDS & COMFORT / Beds',
    'Sunflower Cat Bed': 'All / CATS / BEDS & COMFORT / Beds',
    'V shaped  Cat House ': 'All / CATS / CAT FURNITURE & SCRATCHERS / Cat Houses'
}

for p in odoo_products:
    if p['name'] in mismatches_to_fix:
        target_cat_name = mismatches_to_fix[p['name']]
        # Find closest matching category if exact doesn't exist
        target_id = cat_map.get(target_cat_name)
        if not target_id:
            # try finding partial match
            for c_name, c_id in cat_map.items():
                if c_name.endswith(target_cat_name.split(' / ')[-1]) and ('CATS' in c_name or 'DOGS' in c_name):
                    target_id = c_id
                    break
        
        if target_id:
            models.execute_kw(db, uid, password, 'product.template', 'write', [[p['id']], {'categ_id': target_id}])
            print(f"Fixed Odoo: {p['name']} -> {target_cat_name}")
        else:
            print(f"Could not find category for: {target_cat_name}")
