import urllib.request
import re
from collections import Counter

url = 'https://www.stephanspetstore.co.tz/shop/dogs-food-adult-dog-food'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
response = urllib.request.urlopen(req)
html = response.read().decode('utf-8')

# Extract product titles from the grid. They are likely in <h3> tags
matches = re.findall(r'<h3[^>]*>(.*?)</h3>', html)
names = [re.sub(r'<[^>]+>', '', m).strip() for m in matches if m.strip()]

counts = Counter(names)
duplicates = {name: count for name, count in counts.items() if count > 1}
print(f"URL: {url}")
print(f"Total Cards Found: {len(names)}, Unique: {len(set(names))}")
if duplicates:
    print("Duplicates found on page:")
    for k, v in duplicates.items():
        print(f"  {k}: {v}")
else:
    print("No duplicates found on the first page of the URL.")
