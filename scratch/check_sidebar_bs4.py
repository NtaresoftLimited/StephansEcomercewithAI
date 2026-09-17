import urllib.request
from bs4 import BeautifulSoup

url = 'https://www.stephanspetstore.co.tz/shop'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
response = urllib.request.urlopen(req)
html = response.read().decode('utf-8')

soup = BeautifulSoup(html, "html.parser")
# Find the filter sidebar container. It usually has "Categories" header.
sidebar = soup.find(string="Categories")
if sidebar:
    container = sidebar.find_parent("div").find_parent("div")
    # Get all text from buttons/spans inside
    print("Categories block text:")
    print(container.get_text(separator="\n").strip())
