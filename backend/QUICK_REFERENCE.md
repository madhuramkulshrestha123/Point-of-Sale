# 🚀 POS Backend - Quick Reference Card

## Start Server
```bash
npm run dev          # Development mode
npm start           # Production mode
npm run seed        # Seed database
```

## Server Info
- **URL**: http://localhost:5000
- **Health**: GET /api/health
- **Port**: 5000

## Default Credentials (After Seeding)
- **Email**: admin@pos.com
- **Password**: admin123

## Authentication
```javascript
// Login
POST /api/auth/login
{
  "email": "admin@pos.com",
  "password": "admin123"
}

// Use token in all requests
Authorization: Bearer YOUR_TOKEN_HERE
```

## Most Common Endpoints

### Products
```javascript
GET    /api/products              // List all products
POST   /api/products              // Create product
GET    /api/products/:id          // Get single product
PUT    /api/products/:id          // Update product
DELETE /api/products/:id          // Delete product
```

### Sales
```javascript
POST   /api/sales                 // Create sale
GET    /api/sales                 // List sales
GET    /api/sales/:id             // Get single sale
GET    /api/sales/analytics       // Sales analytics
```

### Inventory
```javascript
GET    /api/inventory             // All inventory
GET    /api/inventory/low-stock   // Low stock items
PUT    /api/inventory/:id         // Update inventory
```

### Analytics
```javascript
GET    /api/analytics/dashboard           // Dashboard data
GET    /api/analytics/revenue-chart       // Revenue chart
GET    /api/analytics/category-breakdown  // Categories
```

### Batches
```javascript
GET    /api/batches               // All batches
GET    /api/batches/expiring/7    // Expiring in 7 days
POST   /api/batches               // Create batch
```

## Sample Request Flow

### 1. Login & Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pos.com","password":"admin123"}'
```

### 2. Create a Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Motor Oil 5W-30",
    "sku": "OIL-001",
    "category": "CATEGORY_ID",
    "costPrice": 25,
    "sellingPrice": 35
  }'
```

### 3. Add Stock (Create Batch)
```bash
curl -X POST http://localhost:5000/api/batches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "product": "PRODUCT_ID",
    "store": "STORE_ID",
    "batchNumber": "BATCH-001",
    "quantity": 100,
    "purchasePrice": 25
  }'
```

### 4. Make a Sale
```bash
curl -X POST http://localhost:5000/api/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "store": "STORE_ID",
    "cashier": "USER_ID",
    "items": [{
      "product": "PRODUCT_ID",
      "quantity": 2,
      "sellingPrice": 35,
      "costPrice": 25
    }],
    "paymentMethod": "cash"
  }'
```

## Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pos_system
JWT_SECRET=change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

## Database Collections
- users
- stores
- categories
- products
- inventories
- batches
- sales
- customers
- suppliers
- purchaseorders
- stocktransfers

## Key Features
✅ FIFO batch deduction
✅ Auto inventory updates
✅ Low stock alerts
✅ Expiry tracking
✅ Multi-store support
✅ Profit calculation
✅ Role-based access

## File Locations
```
models/     → Database schemas
controllers/ → Business logic
routes/     → API endpoints
middleware/ → Auth & validation
```

## Useful Queries

### Filter Products
```
GET /api/products?category=CATEGORY_ID&brand=Premium&search=oil
```

### Sales by Date Range
```
GET /api/sales?startDate=2026-01-01&endDate=2026-12-31
```

### Store-Specific Data
```
GET /api/inventory?store=STORE_ID
```

## Tips
💡 Always include token in Authorization header
💡 Use Postman collection for easier testing
💡 Run seed.js to get sample data quickly
💡 Check server.js for route mounting
💡 MongoDB Compass for database visualization

## Need Help?
- README.md - Full documentation
- QUICK_START.md - Setup guide
- API_OVERVIEW.md - API reference
- SYSTEM_OVERVIEW.md - System architecture

---
**Status**: ✅ Running | **Database**: ✅ Connected