import urllib.request
import re
import time

urls = [
    'http://localhost:3000/brands/bioline',
    'http://localhost:3000/brands/summit10',
    'http://localhost:3000/brands/tropicat',
    'http://localhost:3000/brands/tropidog'
]

time.sleep(2) # Wait for server to be fully ready

for url in urls:
    print(f"\n--- URL: {url} ---")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        html = response.read().decode('utf-8')
        
        if "No products found for" in html:
            print("Status: 'No products found' displayed on page.")
        else:
            matches = re.findall(r'<h3[^>]*>(.*?)</h3>', html)
            names = [re.sub(r'<[^>]+>', '', m).strip() for m in matches if m.strip()]
            
            print(f"Product Cards Found: {len(names)}")
            if names:
                print(f"Sample Products: {names[:4]}")
            else:
                print("Status: No product cards found.")
                
    except Exception as e:
        print(f"Failed to fetch: {e}")
