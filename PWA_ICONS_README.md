# PWA Icon Generation Instructions

Since the image generation service is temporarily unavailable, please create the PWA icons manually:

## Required Icons

You need to create the following icon sizes from your logo (`public/logo.png`):

### Critical Icons (Required for PWA)
- `public/icons/icon-192x192.png` (192x192 pixels)
- `public/icons/icon-512x512.png` (512x512 pixels)

### Additional Recommended Icons
- `public/icons/icon-72x72.png` (72x72 pixels)
- `public/icons/icon-96x96.png` (96x96 pixels)
- `public/icons/icon-128x128.png` (128x128 pixels)
- `public/icons/icon-144x144.png` (144x144 pixels)
- `public/icons/icon-152x152.png` (152x152 pixels)
- `public/icons/icon-384x384.png` (384x384 pixels)

## Design Guidelines

Each icon should:
1. Be a **square** image
2. Have the logo **centered**
3. Use a **gradient background** from #6b3e1e to #8b5e3e (brown/tan)
4. Include **padding** around the logo (don't let it touch the edges)
5. Work well on both light and dark backgrounds

## How to Create

### Option 1: Online Tool (Easiest)
Use a PWA icon generator:
1. Visit https://www.pwabuilder.com/imageGenerator
2. Upload your `logo.png`
3. Set background color to #6b3e1e
4. Download all sizes
5. Place them in `public/icons/` folder

### Option 2: Photoshop/GIMP
1. Open your logo
2. Create new square canvas for each size
3. Add gradient background (#6b3e1e to #8b5e3e)
4. Center logo with padding
5. Export as PNG

### Option 3: ImageMagick (Command Line)
```bash
# Install ImageMagick first
convert logo.png -resize 192x192 -background "#6b3e1e" -gravity center -extent 192x192 icon-192x192.png
convert logo.png -resize 512x512 -background "#6b3e1e" -gravity center -extent 512x512 icon-512x512.png
```

## Verification

After creating icons, verify PWA installation:
1. Run `npm run build && npm run start`
2. Open browser DevTools → Application → Manifest
3. Check that all icons are detected
4. Try installing the PWA on your device

**Note:** The PWA will work without custom icons (using the logo.png as fallback), but custom icons provide a better user experience.
