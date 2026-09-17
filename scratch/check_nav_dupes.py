import json
import re

with open("lib/config/navigation.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Try to find duplicate links or titles in the CATEGORY_MENUS
# Let's just run a quick regex to extract all titles and hrefs
titles = re.findall(r'title:\s*"([^"]+)"', content)
hrefs = re.findall(r'href:\s*"([^"]+)"', content)

from collections import Counter
t_counts = Counter(titles)
h_counts = Counter(hrefs)

dup_titles = {k: v for k, v in t_counts.items() if v > 1}
dup_hrefs = {k: v for k, v in h_counts.items() if v > 1}

print("Duplicate Titles:", dup_titles)
print("Duplicate Hrefs:", dup_hrefs)
