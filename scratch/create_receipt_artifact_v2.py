import xmlrpc.client
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("ODOO_URL")
db = os.getenv("ODOO_DB")
username = os.getenv("ODOO_USER")
password = os.getenv("ODOO_PASSWORD")

common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common', allow_none=True)
uid = common.authenticate(db, username, password, {})
models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object', allow_none=True)

pos_configs = models.execute_kw(db, uid, password, 'pos.config', 'search_read', [[]], {'fields': ['name', 'design_receipt']})

pos_xml = ""
for config in pos_configs:
    if config.get('design_receipt'):
        pos_xml = config['design_receipt']
        break

with open("scratch/current_receipt.xml", "r", encoding="utf-8") as f:
    grooming_xml = f.read()

artifact_path = r"C:\Users\fisto\.gemini\antigravity\brain\fc46a56b-995b-4e1f-b165-cac5571a9ae7\updated_receipt_templates.md"

markdown_content = f"""# Updated Receipt Templates

Here are the complete XML codes for the updated receipt templates.

## Point of Sale Receipt (Design 3)
This is the custom receipt template with the JavaScript bug fix applied (`props.receipt.headerData and props.receipt.headerData.header`). The TIN number and return policy are injected into the footer at print time by the POS configuration.

```xml
{pos_xml.strip()}
```

## Grooming Receipt
This is the QWeb template for the Grooming Receipt, updated to use the company logo instead of text, remove the default Odoo header, strip the pet name from the GRM number, and exclude the return policy.

```xml
{grooming_xml.strip()}
```
"""

with open(artifact_path, "w", encoding="utf-8") as f:
    f.write(markdown_content)

print(f"Created artifact at {artifact_path}")
