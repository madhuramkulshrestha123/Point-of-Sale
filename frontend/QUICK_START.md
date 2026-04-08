# 🚀 Quick Start Guide - AutoParts POS System

## Current Status: ✅ READY TO USE

Your POS screen is fully functional and running at `http://localhost:5173`

---

## 🖥️ How to Use the POS

### 1. Adding Products to Cart
- **Click** any product card in the center grid
- **Scan** barcode using the top input field
- **Quick add** from favorites bar (if starred)

### 2. Managing Cart
- **Increase/Decrease** quantity using +/- buttons
- **Remove item** by clicking ✕ icon
- **Clear all** using the "Clear All Items" button

### 3. Applying Discounts
1. Select discount type: Flat ₹ or Percentage %
2. Enter amount in the input box
3. Click "Apply"

### 4. Completing Sale
1. Click **⚡ CHARGE** button (or press Enter)
2. Select payment method (Cash/UPI/Card)
3. Choose action:
   - 🖨️ Print Invoice
   - 📱 WhatsApp Bill
   - ✓ Start New Bill

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Checkout / Complete sale |
| `Ctrl+K` | Focus search box |
| `Backspace` | Remove last item |
| `F1` | Show help |

---

## 🎯 Try These Actions

### Test Scenario 1: Simple Sale
1. Click "Castrol GTX 20W-50" → Added to cart
2. Click "Brake Pad Set" → Added to cart
3. See total update in right panel
4. Press Enter → Checkout modal opens
5. Click "Start New Bill" → Reset

### Test Scenario 2: Search & Filter
1. Press Ctrl+K
2. Type "Honda" → Shows compatible products
3. Click a product → Added to cart
4. Clear search → All products shown

### Test Scenario 3: Favorites
1. Click ☆ on any product → Becomes ⭐
2. Product appears in Quick Access bar
3. Click from favorites → Instant add to cart

### Test Scenario 4: Barcode Scanner
1. Type a SKU code (e.g., "CAST-GTX-20W50")
2. Press Enter
3. Product auto-added to cart

---

## 🎨 Customization Quick Links

### Change Primary Color
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: '#YOUR_COLOR',  // Change from #4CAF50
}
```

### Add Your Products
Edit `src/data/products.js`:
```javascript
{
  id: 25,
  name: 'Your Product Name',
  category: 'your-category',
  price: 999,
  sku: 'YOUR-SKU-CODE',
  image: '🔧',  // Emoji or image URL
  stock: 50,
  vehicleCompatibility: 'For Specific Car'
}
```

### Modify Tax Rate
Edit `src/store/posStore.js`:
```javascript
taxRate: 18,  // Change from 18% to your rate
```

---

## 🐛 Troubleshooting

### Issue: Page not loading
**Solution:** Run `npm run dev` in terminal

### Issue: Changes not reflecting
**Solution:** Hard refresh with `Ctrl+Shift+R`

### Issue: Styling looks broken
**Solution:** Clear browser cache

---

## 📊 What's Working Now

✅ 3-panel POS layout  
✅ 24 automotive products  
✅ Category filtering  
✅ Smart search  
✅ Barcode scanning  
✅ Favorites system  
✅ Cart management  
✅ Discount calculation  
✅ GST calculation  
✅ Checkout modal  
✅ Keyboard shortcuts  
✅ Responsive design  

---

## 🔜 Next Steps (Choose One)

### Option A: Add Backend API
Build a Node.js + Express backend with database

### Option B: Add More Features
- Customer management
- Employee panels
- Advanced analytics

### Option C: Deploy
Host on Vercel/Railway for production use

---

## 💬 Need Help?

Common commands:
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
```

---

**Your POS is ready! Start billing now! 🎉**
