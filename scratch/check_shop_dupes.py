import urllib.request
import re
from collections import Counter

urls = ['https://www.stephanspetstore.co.tz/shop']

for url in urls:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req)
    html = response.read().decode('utf-8')
    
    matches = re.findall(r'<h3[^>]*>(.*?)</h3>', html)
    names = [re.sub(r'<[^>]+>', '', m).strip() for m in matches if m.strip()]
    
    counts = Counter(names)
    duplicates = {name: count for name, count in counts.items() if count > 1}
    print(f"\nURL: {url}")
    print(f"Total Cards: {len(names)}, Unique: {len(set(names))}")
    if duplicates:
        print("Duplicates found:")
        for k, v in duplicates.items():
            print(f"  {k}: {v}")
    else:
        print("No duplicates found on page.")
