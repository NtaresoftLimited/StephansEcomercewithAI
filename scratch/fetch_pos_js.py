import requests
import re

url = "https://erp.stephanspetstore.co.tz/web/assets/4080113/point_of_sale.assets_prod.min.js"
response = requests.get(url)

if response.status_code == 200:
    content = response.text
    # We want to find whenMounted and printWeb
    # Let's search for "innerHTML"
    matches = re.finditer(r'.{0,100}innerHTML.{0,100}', content)
    with open("scratch/js_error_context.txt", "w", encoding="utf-8") as f:
        for m in matches:
            f.write(m.group(0) + "\n---\n")
    print("Saved context to scratch/js_error_context.txt")
else:
    print(f"Failed to fetch JS: {response.status_code}")
