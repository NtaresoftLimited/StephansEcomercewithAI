with open("app/(app)/brands/[slug]/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_image_mapping = """        images: p.image_512 ? [{
            _key: 'main',
            asset: { url: `data:image/png;base64,${p.image_512}` }
        }] : [],"""
        
new_image_mapping = """        images: p.image_512 ? [{
            _key: 'main',
            asset: { url: `https://erp.stephanspetstore.co.tz/web/image/product.template/${p.id}/image_1920` }
        }] : [],"""

content = content.replace(old_image_mapping, new_image_mapping)

with open("app/(app)/brands/[slug]/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
