import urllib.request
import re

url = 'https://www.stephanspetstore.co.tz/shop'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
response = urllib.request.urlopen(req)
html = response.read().decode('utf-8')

# The sidebar categories in ProductFilters are rendered as CollapsibleTrigger spans
# Let's extract them
matches = re.findall(r'<span class="text-sm font-semibold">([^<]+)</span>', html)
print("Top-level categories in sidebar:", matches)
