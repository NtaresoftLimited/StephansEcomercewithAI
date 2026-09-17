import urllib.request
import re

url = 'https://www.stephanspetstore.co.tz/shop'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
response = urllib.request.urlopen(req)
html = response.read().decode('utf-8')

# The categories are likely in a list or div. Let's look for hrefs containing /shop/
matches = re.findall(r'href="/shop/([^"]+)"', html)
categories = [m for m in matches if '?' not in m and m != '']

from collections import Counter
counts = Counter(categories)
duplicates = {k: v for k, v in counts.items() if v > 1}

print("Categories found on /shop:")
print(list(set(categories))[:20])

if duplicates:
    print("Duplicates found:")
    for k, v in duplicates.items():
        print(f"  {k}: {v}")
else:
    print("No duplicate category links on /shop.")
