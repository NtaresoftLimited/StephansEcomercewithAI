import urllib.request
import re

url = 'https://www.stephanspetstore.co.tz/shop'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
response = urllib.request.urlopen(req)
html = response.read().decode('utf-8')

# Look for text around "Categories"
idx = html.find('>Categories<')
if idx != -1:
    snippet = html[idx:idx+2000]
    # strip all HTML tags
    clean = re.sub(r'<[^>]+>', '\n', snippet)
    clean = "\n".join([line.strip() for line in clean.split('\n') if line.strip()])
    print("Sidebar snippet:")
    print(clean[:1000])
