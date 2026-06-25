import xmlrpc.client

ODOO_URL = "https://erp.stephanspetstore.co.tz"
ODOO_DB = "Stephans"
ODOO_USER = "info@stephanspetstore.co.tz"
ODOO_PASSWORD = "Stephan@3202"

print(f"--- Debugging Odoo Auth for {ODOO_USER} ---")
common = xmlrpc.client.ServerProxy(f"{ODOO_URL}/xmlrpc/2/common")
try:
    uid = common.authenticate(ODOO_DB, ODOO_USER, ODOO_PASSWORD, {})
    if uid:
        print(f"✅ Authenticated successfully! UID: {uid}")
        
        models = xmlrpc.client.ServerProxy(f"{ODOO_URL}/xmlrpc/2/object")
        
        # Test 1: Check if grooming.appointment exists and we can count it
        try:
            count = models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD, 'grooming.appointment', 'search_count', [[]])
            print(f"✅ Successfully queried grooming.appointment! Count: {count}")
        except Exception as e:
            print(f"❌ Failed to query grooming.appointment: {e}")
            
        # Test 2: Check model access rights
        try:
            access = models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD, 'grooming.appointment', 'check_access_rights', ['read'], {'raise_exception': False})
            print(f"✅ Read access to grooming.appointment: {access}")
            
            access_create = models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD, 'grooming.appointment', 'check_access_rights', ['create'], {'raise_exception': False})
            print(f"✅ Create access to grooming.appointment: {access_create}")
        except Exception as e:
            print(f"❌ Failed to check access rights: {e}")

    else:
        print("❌ Authentication failed (UID is null).")
except Exception as e:
    print(f"❌ Connection error: {e}")
