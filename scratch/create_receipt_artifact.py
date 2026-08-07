import os

artifact_path = r"C:\Users\fisto\.gemini\antigravity\brain\fc46a56b-995b-4e1f-b165-cac5571a9ae7\updated_receipt_templates.md"

with open("scratch/pos_receipt_output.xml", "r", encoding="utf-8") as f:
    pos_content = f.read()

# Clean up the output to just contain the XML of the first config
pos_xml = ""
in_xml = False
for line in pos_content.split("\n"):
    if line.startswith("--- Config:"):
        if in_xml:
            break
        in_xml = True
        continue
    if in_xml:
        pos_xml += line + "\n"

with open("scratch/current_receipt.xml", "r", encoding="utf-8") as f:
    grooming_xml = f.read()

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
