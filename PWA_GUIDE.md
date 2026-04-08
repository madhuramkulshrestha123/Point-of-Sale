# PWA (Progressive Web App) Implementation Guide

## Overview
Your POS (Point of Sale) system now works as a Progressive Web App with full offline support!

## Features Implemented

### 1. **Offline Support**
- ✅ App works without internet connection using cached data
- ✅ Automatic caching of products, customers, and categories
- ✅ Intelligent cache management with expiration times
- ✅ Offline banner shows when connection is lost

### 2. **Caching Strategies**
- **Network First** for API requests (tries network, falls back to cache)
- **Cache First** for images (faster loading)
- **Stale While Revalidate** for fonts
- Cache expiration:
  - Products: 1 hour
  - Customers: 1 hour
  - Categories: 1 hour
  - Cart: 24 hours

### 3. **Install Prompt**
- ✅ Users can install the app on their device
- ✅ Automatic prompt after 30 seconds on second visit
- ✅ Custom install button available
- ✅ Works in standalone mode (like a native app)

### 4. **Auto-Updates**
- ✅ Service worker automatically updates when new version is available
- ✅ Users prompted to reload when update is detected

## How It Works

### Offline Data Flow

1. **First Load (Online)**
   - App fetches data from backend API
   - Data is automatically cached in localStorage
   - Service worker caches static assets

2. **Subsequent Loads (Offline)**
   - App checks network status
   - If offline, uses cached data from localStorage
   - Shows offline banner at the top
   - All previously loaded data is available

3. **Back Online**
   - Network status detected automatically
   - Fresh data fetched from API
   - Cache updated with latest data
   - Offline banner disappears

### Service Worker Caching

The service worker (`sw.js`) handles:
- Precaching of all static assets (JS, CSS, HTML, images)
- Runtime caching for API requests
- Image caching for faster loading
- Google Fonts caching

### API Integration

The app uses the custom API wrapper (`src/api/index.js`) which:
- Detects online/offline status
- Automatically caches GET requests
- Falls back to cache when offline
- Shows error if no cached data available
- Blocks write operations (POST/PUT/DELETE) when offline

## Usage Instructions

### Installing the App

**Desktop:**
1. Look for the install prompt in the bottom-right corner
2. Click "Install Now"
3. App will be added to your desktop/applications

**Mobile:**
1. Tap the browser's "Add to Home Screen" option
2. Or use the install prompt when it appears
3. App will be added to your home screen

### Testing Offline Mode

1. **Browser DevTools Method:**
   - Open DevTools (F12)
   - Go to Network tab
   - Check "Offline" checkbox
   - Reload the page
   - App will use cached data

2. **Real Offline:**
   - Disconnect from internet
   - Open the app
   - You'll see the offline banner
   - Previously loaded data will be available

### Managing Cache

**Clear Cache:**
```javascript
// In browser console or your code
import { clearAllCaches } from './utils/offlineCache';
clearAllCaches();
```

**View Cache:**
```javascript
// Check what's cached
console.log(localStorage.getItem('pos_products_cache'));
console.log(localStorage.getItem('pos_customers_cache'));
```

## File Structure

```
Point of Sale/
├── public/
│   ├── offline.html              # Offline fallback page
│   ├── pwa-192x192.svg          # PWA icon (192x192)
│   └── pwa-512x512.svg          # PWA icon (512x512)
├── src/
│   ├── api/
│   │   └── index.js              # API wrapper with offline support
│   ├── components/
│   │   ├── OfflineBanner.jsx     # Offline status indicator
│   │   └── PWAInstallPrompt.jsx  # Install prompt component
│   ├── utils/
│   │   └── offlineCache.js       # Cache management utilities
│   ├── sw.js                     # Service worker
│   ├── main.jsx                  # SW registration
│   └── App.jsx                   # Added PWA components
├── vite.config.js                # PWA plugin configuration
└── index.html                    # Added PWA meta tags
```

## Configuration

### Customize Cache Duration

Edit `src/utils/offlineCache.js`:
```javascript
const CACHE_DURATION = {
  PRODUCTS: 60 * 60 * 1000,     // 1 hour
  CUSTOMERS: 60 * 60 * 1000,    // 1 hour
  CATEGORIES: 60 * 60 * 1000,   // 1 hour
  CART: 24 * 60 * 60 * 1000,    // 24 hours
  SETTINGS: 24 * 60 * 60 * 1000 // 24 hours
};
```

### Change Caching Strategy

Edit `vite.config.js` in the workbox section:
```javascript
workbox: {
  runtimeCaching: [
    {
      urlPattern: /\/api\/.*/i,
      handler: 'NetworkFirst', // Options: NetworkFirst, CacheFirst, StaleWhileRevalidate
      options: { ... }
    }
  ]
}
```

## Important Notes

### ⚠️ Limitations When Offline

1. **Cannot Create Sales**: Requires internet to process payments
2. **Cannot Update Inventory**: Stock changes need server connection
3. **Cannot Add Customers**: New customer creation requires server
4. **Limited Real-time Data**: Analytics may show cached data

### ✅ What Works Offline

1. View products (cached data)
2. View customers (cached data)
3. View categories (cached data)
4. Browse inventory
5. View cart
6. Access most POS features (read-only)

### Best Practices

1. **First Use Online**: Always open the app while online first to cache data
2. **Regular Sync**: Connect to internet regularly to refresh cached data
3. **Important Operations**: Complete critical transactions while online
4. **Cache Management**: Clear cache periodically if data seems outdated

## Troubleshooting

### App Not Working Offline?

1. **Check Cache**: Open browser console and run:
   ```javascript
   console.log(localStorage.getItem('pos_products_cache'));
   ```
   If null, you need to load data online first.

2. **Service Worker Not Registered?**
   - Check console for "SW registered" message
   - Clear browser cache and reload
   - Check Application > Service Workers in DevTools

3. **Stale Data?**
   - Cache might be expired
   - Reconnect to internet to refresh
   - Clear cache: `clearAllCaches()`

### App Not Installing?

1. Make sure you're on HTTPS or localhost
2. Check if manifest.json is loading (Network tab)
3. Verify service worker is active
4. Try different browser

### Cache Not Updating?

1. Force refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear application cache in DevTools
3. Check network requests in Network tab

## Testing Checklist

- [ ] App loads while online
- [ ] Data is cached on first load
- [ ] App works when going offline
- [ ] Offline banner appears when disconnected
- [ ] Cached data is accessible offline
- [ ] Install prompt appears
- [ ] App works in standalone mode after install
- [ ] App updates when new version is deployed
- [ ] Cache expires and refreshes properly

## Next Steps

To enhance offline capabilities further, consider:
1. Implementing a queue for offline transactions
2. Background sync when connection is restored
3. More granular cache control per feature
4. Offline payment processing with local storage
5. Conflict resolution for offline data changes

## Support

For issues or questions about PWA functionality, check:
- Browser console for errors
- Service Worker tab in DevTools
- Application > Storage to see cached data
- Network tab to see caching strategies in action
