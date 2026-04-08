# PWA Testing Guide

## Quick Start

Your POS system is now running at: **http://localhost:5175/**

## Testing Checklist

### ✅ Phase 1: Basic PWA Functionality

1. **Open the app in your browser**
   - Navigate to: http://localhost:5175/
   - Open DevTools (F12) → Console
   - You should see: "✅ Service Worker registered successfully"

2. **Check PWA Meta Tags**
   - In DevTools, go to Application tab
   - Click on "Manifest" 
   - Verify manifest is loaded
   - Check icons are displayed

3. **Verify Service Worker**
   - In DevTools → Application → Service Workers
   - You should see a service worker registered
   - Status should be "Activated and Running"

### ✅ Phase 2: Test Offline Mode

#### Method 1: Using DevTools

1. **Load the app while online**
   - Make sure you're logged in
   - Navigate to POS page
   - Let products load completely

2. **Go Offline**
   - Open DevTools (F12)
   - Go to Network tab
   - Check the "Offline" checkbox

3. **Test Offline Features**
   - ✅ Offline banner appears at top
   - ✅ Previously loaded products are still visible
   - ✅ You can still search products (from cache)
   - ✅ Cart functionality works
   - ✅ Categories work (if cached)

4. **Reload Page While Offline**
   - Press Ctrl+R or F5
   - Page should load with cached data
   - Products should still be visible

#### Method 2: Real Offline Test

1. Disconnect from WiFi/internet
2. Open the app
3. Verify it works with cached data

### ✅ Phase 3: Test Install Prompt

#### Desktop (Chrome/Edge)

1. **Wait for Install Prompt**
   - After using the app for ~30 seconds
   - A prompt should appear in bottom-right corner
   - OR look for install icon in address bar

2. **Click "Install Now"**
   - App will be installed
   - Opens in a new window (standalone mode)
   - Works like a native app

#### Mobile

1. **Add to Home Screen**
   - Chrome: Menu → "Add to Home Screen"
   - Safari (iOS): Share → "Add to Home Screen"
   - App icon appears on home screen

2. **Launch from Home Screen**
   - Tap the icon
   - Opens in fullscreen (no browser UI)
   - Works like native app

### ✅ Phase 4: Test Auto-Updates

1. **Make a Code Change**
   - Modify any component
   - Save the file

2. **Rebuild the App**
   ```bash
   npm run build
   ```

3. **Reload the Page**
   - You should see a prompt: "New version available! Reload to update?"
   - Click OK to reload
   - New version is loaded

### ✅ Phase 5: Cache Management

1. **Check Cached Data**
   Open browser console and run:
   ```javascript
   // Check products cache
   console.log('Products:', localStorage.getItem('pos_products_cache'));
   
   // Check customers cache
   console.log('Customers:', localStorage.getItem('pos_customers_cache'));
   
   // Check categories cache
   console.log('Categories:', localStorage.getItem('pos_categories_cache'));
   ```

2. **Clear Cache**
   ```javascript
   import { clearAllCaches } from './utils/offlineCache';
   clearAllCaches();
   ```

3. **Check Service Worker Cache**
   - DevTools → Application → Cache Storage
   - You should see several caches:
     - `pos-api-cache`
     - `pos-images-cache`
     - Workbox caches

## Common Issues & Solutions

### Issue: Service Worker Not Registering

**Solution:**
1. Make sure you're on localhost or HTTPS
2. Clear browser cache completely
3. Hard reload: Ctrl+Shift+R
4. Check console for errors

### Issue: Offline Mode Not Working

**Possible causes:**
1. **No data cached yet**
   - Solution: Load the app while online first
   - Let products fully load

2. **Cache expired**
   - Solution: Reconnect to refresh cache
   - Increase cache duration in `offlineCache.js`

3. **Service worker not active**
   - Check: DevTools → Application → Service Workers
   - Should show "Activated and Running"

### Issue: Install Prompt Not Appearing

**Requirements:**
1. Must be on HTTPS or localhost ✓
2. Must have valid manifest.json ✓
3. Service worker must be registered ✓
4. User must have visited at least twice (or wait 30s)

**Manual Install:**
- Chrome: Click install icon in address bar
- Chrome: Menu → "Install POS App"
- Edge: Menu → "Install this site as an app"

### Issue: Stale Data

**Symptoms:**
- Products showing old prices
- Inventory counts not updating

**Solution:**
1. Reconnect to internet
2. Reload page to refresh cache
3. Or clear cache manually:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

## Advanced Testing

### Test Network Throttling

1. DevTools → Network tab
2. Change from "Online" to "Slow 3G" or "Fast 3G"
3. Observe loading behavior
4. App should use cache when network is slow

### Test Different Caching Strategies

Edit `vite.config.js`:

```javascript
// Change from NetworkFirst to CacheFirst for API
{
  urlPattern: /\/api\/.*/i,
  handler: 'CacheFirst', // Try this
  options: { ... }
}
```

### Simulate First-Time User

1. Clear all data:
   ```javascript
   // Console
   localStorage.clear();
   sessionStorage.clear();
   ```
2. DevTools → Application → Clear storage
3. Reload page

### Test Standalone Mode

1. Install the app
2. Launch from taskbar/home screen
3. Verify:
   - No browser UI (address bar, etc.)
   - Full screen experience
   - All features work
   - Offline still works

## Performance Testing

### Load Time Comparison

**Online (First Load):**
- Time: _____ seconds
- Includes: Download + Parse + API calls

**Online (Cached):**
- Time: _____ seconds  
- Should be faster due to service worker

**Offline:**
- Time: _____ seconds
- Uses only cached data
- No API calls

### Cache Size

Check in DevTools → Application → Cache Storage
- Total cache size: _____ KB
- Number of entries: _____

## Browser Compatibility

Test on multiple browsers:

- [ ] Chrome/Edge (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Mac/iOS)
- [ ] Chrome (Android)
- [ ] Samsung Internet

## Feature Matrix

| Feature | Online | Offline | Notes |
|---------|--------|---------|-------|
| View Products | ✅ | ✅ | Cached |
| View Customers | ✅ | ✅ | Cached |
| Search Products | ✅ | ✅ | Cached data |
| Add to Cart | ✅ | ✅ | Local only |
| Create Sale | ✅ | ❌ | Requires server |
| Update Inventory | ✅ | ❌ | Requires server |
| Analytics | ✅ | ✅ | Cached |
| Install Prompt | ✅ | ✅ | PWA feature |

## Success Criteria

Your PWA is working correctly if:

- ✅ Service worker registers successfully
- ✅ Manifest is detected by browser
- ✅ Install prompt appears
- ✅ App works offline with cached data
- ✅ Offline banner shows when disconnected
- ✅ Auto-updates work when new version deployed
- ✅ App works in standalone mode after install
- ✅ Cache refreshes when back online

## Reporting Issues

If you find any issues, note:

1. **Browser & Version**: e.g., Chrome 120
2. **Device**: e.g., Windows PC, iPhone 13
3. **Online or Offline**: 
4. **Console Errors**: (copy from DevTools)
5. **Steps to Reproduce**: 
6. **Expected vs Actual Behavior**:

## Next Steps After Testing

1. ✅ Deploy to production (HTTPS required)
2. ✅ Test on real devices (phones, tablets)
3. ✅ Monitor cache performance
4. ✅ Gather user feedback
5. ✅ Implement additional features:
   - Background sync
   - Offline transaction queue
   - Push notifications
   - More granular caching

## Production Deployment

**IMPORTANT**: PWA requires HTTPS in production!

Update your backend URL in `.env`:
```
VITE_API_URL=https://your-api-domain.com/api
```

Build for production:
```bash
npm run build
```

Deploy the `dist` folder to your hosting.
