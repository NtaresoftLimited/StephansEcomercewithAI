import zipfile
import os

zip_path = r"D:\CODEX\STEPHANS OG\stephans-pet-app\addons.zip"
target_entry = "bi_pos_paid_posted_order_delete/models/res_config_setting.py"
output_path = r"D:\CODEX\STEPHANS OG\stephans-pet-app\res_config_setting_fixed.py"

with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    try:
        with zip_ref.open(target_entry) as source, open(output_path, 'wb') as target:
            target.write(source.read())
        print("Extracted Successfully")
    except KeyError:
        print("Entry not found in zip")
