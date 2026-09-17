import os

filepath = "components/app/ReturnPolicyClient.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace titles
content = content.replace('"Eligible items"', '"Items"')
content = content.replace('"24-hour window"', '"24 - Hour Window"')
content = content.replace('"Exchange only"', '"Exchange Only"')
content = content.replace('"Original receipt"', '"Original Receipt"')

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
