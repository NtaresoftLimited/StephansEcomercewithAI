import xmlrpc.client

url = 'https://erp.stephanspetstore.co.tz'
db = 'Stephans'
username = 'info@stephanspetstore.co.tz'
password = 'Stephan@3202'

common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
uid = common.authenticate(db, username, password, {})

models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(url))

# 1. Create Training Equipment under TRAINING & BEHAVIOR (1282)
training_eq_id = models.execute_kw(db, uid, password, 'product.category', 'create', [{
    'name': 'Training Equipment',
    'parent_id': 1282
}])
print("Created Training Equipment, ID:", training_eq_id)

# 2. Create Home and Crates under CATS (1116)
home_crates_id = models.execute_kw(db, uid, password, 'product.category', 'create', [{
    'name': 'Home and Crates',
    'parent_id': 1116
}])
print("Created Home and Crates, ID:", home_crates_id)

# 3. Create Traveling Essentials under Home and Crates (home_crates_id)
traveling_essentials_id = models.execute_kw(db, uid, password, 'product.category', 'create', [{
    'name': 'Traveling Essentials',
    'parent_id': home_crates_id
}])
print("Created Traveling Essentials, ID:", traveling_essentials_id)
