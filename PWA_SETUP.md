# PWA Setup Instructions

Your Next.js website is now configured as a Progressive Web App! Here's what you need to do to complete the setup:

## Step 1: Install next-pwa Package

The `next-pwa` package needs to be installed. Run this command:

```bash
npm install next-pwa
```

**Note:** If you encounter PowerShell execution policy errors, use one of these alternatives:
- Run in Command Prompt (cmd) instead
- Or use: `powershell -ExecutionPolicy Bypass -Command "npm install next-pwa"`

## Step 2: Generate App Icons

Create PWA icons from your logo. See `PWA_ICONS_README.md` for detailed instructions.

**Quick option:** Use https://www.pwabuilder.com/imageGenerator
1. Upload `public/logo.png`
2. Set background color to #6b3e1e
3. Download all sizes
4. Extract to `public/icons/` folder

**Required icons:**
- icon-192x192.png (192x192 pixels) - **Critical**
- icon-512x512.png (512x512 pixels) - **Critical**

## Step 3: Build and Test

```bash
# Build the app
npm run build

# Start production server
npm start
```

## Step 4: Test PWA Installation

### On Desktop (Chrome/Edge):
1. Open your site in Chrome
2. Look for install icon in address bar
3. Click "Install"
4. App opens in standalone window

### On Android:
1. Open site in Chrome
2. Tap menu (3 dots)
3. Select "Add to Home screen"
4. App icon appears on home screen

### On iOS/Safari:
1. Open site in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. App icon appears on home screen

## Step 5: Verify PWA Score

1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Progressive Web App"
4. Click "Generate report"
5. Target score: 100

## What's Already Done ✅

- ✅ manifest.json with brand colors (#6b3e1e)
- ✅ Service worker configuration with smart caching
- ✅ PWA meta tags in layout
- ✅ Offline fallback page
- ✅ Apple/Android compatibility settings

## Features Enabled

Your PWA now supports:
- 📱 **Installable** - Add to home screen
- ⚡ **Fast** - Cached resources load instantly
- 🔌 **Offline** - Core pages work without internet
- 🖥️ **Standalone** - Runs like a native app
- 🎨 **Branded** - Uses your brand color (#6b3e1e)

## Troubleshooting

**Icons not showing?**
- Make sure icons are in `public/icons/` folder
- Check manifest.json paths match icon filenames
- Clear browser cache and rebuild

**Install button not appearing?**
- Must use HTTPS in production
- All PWA requirements must be met
- Check DevTools → Application → Manifest

**Service worker not registering?**
- Only works in production mode (`npm run build && npm start`)
- Disabled in development mode by default
- Check Console for errors

## Next Steps (Optional)

Consider adding:
- Push notifications
- Background sync
- App shortcuts in manifest
- Share target API
