import urllib.request
import re
url = 'https://www.stephanspetstore.co.tz/shop/dogs-bowls-feeders-elevated-bowls'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    response = urllib.request.urlopen(req)
    html = response.read().decode('utf-8')
    matches = re.findall(r'<h3[^>]*>(.*?)</h3>', html)
    names = [re.sub(r'<[^>]+>', '', m).strip() for m in matches if m.strip()]
    print(f"Total Cards Found: {len(names)}")
    for n in names:
        print(f"  {n}")
except Exception as e:
    print("Error:", e)
