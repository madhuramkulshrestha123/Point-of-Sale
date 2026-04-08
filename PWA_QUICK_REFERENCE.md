# PWA Quick Reference Card

## 🚀 Quick Start

**Dev Server**: http://localhost:5175/

```bash
# Start development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Install the App

### Desktop (Chrome/Edge)
1. Look for install icon in address bar (⊕)
2. OR: Menu → "Install POS App"
3. App opens in standalone window

### Mobile
1. Chrome: Menu → "Add to Home Screen"
2. Safari (iOS): Share → "Add to Home Screen"
3. Icon appears on home screen

## 🔌 Test Offline Mode

### Method 1: DevTools
```
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. Reload page (Ctrl+R)
5. App works with cached data!
```

### Method 2: Real Offline
```
1. Disconnect from internet
2. Open app
3. See cached data
```

## 🗂️ Cache Management

### View Cache (Browser Console)
```javascript
// Check what's cached
console.log('Products:', localStorage.getItem('pos_products_cache'));
console.log('Customers:', localStorage.getItem('pos_customers_cache'));
console.log('Categories:', localStorage.getItem('pos_categories_cache'));
```

### Clear Cache
```javascript
// Clear all caches
localStorage.clear();
location.reload();
```

## ⚙️ Configuration

### Cache Duration
File: `src/utils/offlineCache.js`

```javascript
const CACHE_DURATION = {
  PRODUCTS: 60 * 60 * 1000,     // 1 hour
  CUSTOMERS: 60 * 60 * 1000,    // 1 hour
  CATEGORIES: 60 * 60 * 1000,   // 1 hour
  CART: 24 * 60 * 60 * 1000,    // 24 hours
};
```

### Caching Strategy
File: `vite.config.js`

```javascript
handler: 'NetworkFirst'  // Try network, fallback to cache
handler: 'CacheFirst'    // Use cache, faster
handler: 'StaleWhileRevalidate' // Use cache, update in background
```

## 📊 What Works Offline

✅ **Works:**
- View products (cached)
- View customers (cached)
- View categories (cached)
- Search products
- Browse inventory
- Add to cart
- View analytics (cached)

❌ **Doesn't Work:**
- Create sales (needs server)
- Update inventory (needs server)
- Add customers (needs server)
- Process payments (needs server)

## 🔧 Troubleshooting

### App Not Working Offline?
1. Load app while ONLINE first
2. Let data fully load (products, customers, etc.)
3. Then go offline

### Stale Data?
```javascript
// Clear cache and reload
localStorage.clear();
location.reload();
```

### Install Prompt Not Showing?
- Visit the app 2+ times
- Wait 30 seconds after loading
- Or use browser menu → "Install"

### Service Worker Issues?
```
1. DevTools → Application → Service Workers
2. Unregister service worker
3. Clear all site data
4. Hard reload (Ctrl+Shift+R)
5. Reload page
```

## 📁 Key Files

```
src/
├── api/index.js              ← API with offline support
├── components/
│   ├── OfflineBanner.jsx     ← Offline indicator
│   └── PWAInstallPrompt.jsx  ← Install prompt
├── utils/
│   └── offlineCache.js       ← Cache utilities
└── sw.js                     ← Service worker

public/
├── offline.html              ← Offline fallback page
├── pwa-192x192.svg          ← App icon
└── pwa-512x512.svg          ← App icon
```

## 🌐 Production Deployment

**MUST HAVE HTTPS!**

1. Update API URL in `.env`:
   ```
   VITE_API_URL=https://your-api.com/api
   ```

2. Build:
   ```bash
   npm run build
   ```

3. Deploy `dist/` folder

4. Test on real devices!

## 📱 PWA Features

- ✅ **Offline Support**: Works without internet
- ✅ **Installable**: Add to home screen
- ✅ **Standalone**: Works like native app
- ✅ **Auto-updates**: Refreshes when new version
- ✅ **Fast**: Cached for quick loading
- ✅ **Responsive**: Works on all devices

## 🎯 Quick Test Checklist

- [ ] App loads online
- [ ] Service worker registered (check console)
- [ ] Go offline (DevTools → Network → Offline)
- [ ] App still works offline
- [ ] Offline banner appears
- [ ] Install prompt appears
- [ ] Can install and run standalone
- [ ] Reconnect → cache refreshes

## 💡 Pro Tips

1. **First Use**: Always open online first to cache data
2. **Regular Sync**: Connect regularly to refresh cache
3. **Important Tasks**: Do critical work while online
4. **Clear Cache**: If data seems outdated
5. **Test Early**: Test offline mode before production

## 🆘 Need Help?

1. Check browser console for errors
2. Check Service Workers tab in DevTools
3. Check Cache Storage in DevTools
4. Read PWA_GUIDE.md for detailed info
5. Read PWA_TESTING_GUIDE.md for testing steps

---

**Enjoy your offline-capable POS system! 🎉**
