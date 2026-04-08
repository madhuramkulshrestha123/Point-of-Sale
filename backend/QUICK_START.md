# Quick Start Guide - POS Backend

## Step 1: Install MongoDB

### Windows
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run as a Windows service automatically

### Verify MongoDB is running:
```bash
mongosh
```

## Step 2: Setup Backend

Open terminal in the backend folder:

```bash
cd backend
npm install
```

## Step 3: Configure Environment

The `.env` file is already created with default settings. Update if needed:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pos_system
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

## Step 4: Start the Server

```bash
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

## Step 5: Test the API

### Health Check
```bash
GET http://localhost:5000/api/health
```

### Register First User (Admin)
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@pos.com",
  "password": "admin123",
  "role": "admin"
}
```

### Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@pos.com",
  "password": "admin123"
}
```

Save the token from the response for authenticated requests.

### Create a Store
```bash
POST http://localhost:5000/api/stores
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Main Store",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "phone": "555-0123",
  "email": "mainstore@pos.com"
}
```

### Create a Category
```bash
POST http://localhost:5000/api/categories
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Motor Oil",
  "description": "Engine oils and lubricants"
}
```

### Create a Product
```bash
POST http://localhost:5000/api/products
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Synthetic Motor Oil 5W-30",
  "sku": "OIL-5W30-001",
  "category": "CATEGORY_ID_HERE",
  "brand": "Premium",
  "costPrice": 25.00,
  "sellingPrice": 35.00,
  "vehicleCompatibility": ["Honda", "Toyota", "Ford"]
}
```

### Create a Batch (Add Stock)
```bash
POST http://localhost:5000/api/batches
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "product": "PRODUCT_ID_HERE",
  "store": "STORE_ID_HERE",
  "batchNumber": "BATCH-001",
  "quantity": 100,
  "purchasePrice": 25.00,
  "expiryDate": "2026-12-31"
}
```

### Make a Sale
```bash
POST http://localhost:5000/api/sales
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "store": "STORE_ID_HERE",
  "cashier": "USER_ID_HERE",
  "items": [
    {
      "product": "PRODUCT_ID_HERE",
      "quantity": 2,
      "sellingPrice": 35.00,
      "costPrice": 25.00
    }
  ],
  "paymentMethod": "cash",
  "discount": 0,
  "tax": 5.60
}
```

### Get Analytics Dashboard
```bash
GET http://localhost:5000/api/analytics/dashboard
Authorization: Bearer YOUR_TOKEN_HERE
```

## Common Issues

### MongoDB Connection Error
Make sure MongoDB is running:
```bash
# Windows
net start MongoDB

# Check if running
mongosh
```

### Port Already in Use
Change the PORT in `.env` file or stop the process using port 5000.

### Authentication Errors
Make sure to include the token in the Authorization header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

## Next Steps

1. Create stores
2. Add categories
3. Add products
4. Create batches to add inventory
5. Start making sales
6. View analytics dashboard

## Testing with Postman

1. Import all endpoints into Postman
2. Create an environment variable for `token`
3. Set token after login
4. Test all endpoints

## Testing with cURL

Example login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pos.com","password":"admin123"}'
```

## Production Deployment

For production deployment:

1. **Environment Variables**: Update `.env` with production values
2. **Database**: Use MongoDB Atlas or hosted MongoDB
3. **Security**: 
   - Change JWT_SECRET to a strong random value
   - Enable HTTPS
   - Add rate limiting
4. **Process Manager**: Use PM2 for process management
   ```bash
   npm install -g pm2
   pm2 start server.js
   ```

## Additional Resources

- Full API Documentation: README.md
- MongoDB Docs: https://docs.mongodb.com/
- Express Docs: https://expressjs.com/
