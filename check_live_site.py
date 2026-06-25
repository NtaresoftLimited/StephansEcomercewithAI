import urllib.request

def main():
    try:
        req = urllib.request.Request("https://www.stephanspetstore.co.tz/", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as response:
            html = response.read().decode()
            print("Successfully loaded.")
            if "Application error" in html:
                print("Application error found in HTML!")
            else:
                print("No application error found.")
    except Exception as e:
        print(f"Failed to load: {e}")
        if hasattr(e, 'read'):
            html = e.read().decode()
            print("Error HTML snippet:")
            print(html[:1000])

if __name__ == "__main__":
    main()
