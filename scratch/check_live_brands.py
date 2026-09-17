import urllib.request
import re

urls = [
    'https://www.stephanspetstore.co.tz/brands/bioline',
    'https://www.stephanspetstore.co.tz/brands/summit10',
    'https://www.stephanspetstore.co.tz/brands/tropicat',
    'https://www.stephanspetstore.co.tz/brands/tropidog'
]

for url in urls:
    print(f"\n--- URL: {url} ---")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        html = response.read().decode('utf-8')
        
        # Check for error or no products
        if "No products found for" in html:
            print("Status: 'No products found' displayed on page.")
        else:
            # Find h3 tags which contain the product names
            matches = re.findall(r'<h3[^>]*>(.*?)</h3>', html)
            # Filter out empty or irrelevant h3s
            names = [re.sub(r'<[^>]+>', '', m).strip() for m in matches if m.strip()]
            
            print(f"Product Cards Found: {len(names)}")
            if names:
                print(f"Sample Products: {names[:4]}")
            else:
                print("Status: No product cards found (and 'No products found' message missing).")
                
    except Exception as e:
        print(f"Failed to fetch: {e}")
