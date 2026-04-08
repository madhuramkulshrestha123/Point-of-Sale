# POS Backend - API Overview

## 🚀 Quick Start

1. **Start MongoDB**: Make sure MongoDB is running on your system
2. **Install dependencies**: `npm install`
3. **Configure .env**: Update environment variables if needed
4. **Start server**: `npm run dev`
5. **Server runs on**: `http://localhost:5000`

## 📋 Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pos_system
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

## 🔐 Authentication

All protected endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <your_token_here>
```

### User Roles
- **Admin**: Full access to all features
- **Manager**: Most features except critical admin operations
- **Cashier**: Sales and basic product lookup

## 📚 API Endpoints Summary

### 🔑 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login user |
| GET | `/me` | Private | Get current user |

### 🏪 Stores (`/api/stores`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | Get all stores |
| GET | `/:id` | Private | Get single store |
| POST | `/` | Admin | Create store |
| PUT | `/:id` | Admin | Update store |
| DELETE | `/:id` | Admin | Delete store |

### 📂 Categories (`/api/categories`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | Get all categories |
| GET | `/:id` | Private | Get single category |
| POST | `/` | Admin/Manager | Create category |
| PUT | `/:id` | Admin/Manager | Update category |
| DELETE | `/:id` | Admin | Delete category |

### 📦 Products (`/api/products`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | Get all products |
| GET | `/:id` | Private | Get single product |
| POST | `/` | Admin/Manager | Create product |
| PUT | `/:id` | Admin/Manager | Update product |
| DELETE | `/:id` | Admin | Delete product |

**Query Parameters**: `category`, `brand`, `search`, `page`, `limit`

### 📊 Inventory (`/api/inventory`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | Get all inventory |
| GET | `/low-stock` | Private | Get low stock items |
| GET | `/product/:productId/store/:storeId` | Private | Get product inventory |
| PUT | `/:id` | Private | Update inventory |

### 🔄 Batches (`/api/batches`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | Get all batches |
| GET | `/expiring/:days` | Private | Get expiring batches |
| POST | `/` | Private | Create batch |
| PUT | `/:id` | Private | Update batch |

### 🛒 Sales (`/api/sales`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | Get all sales |
| GET | `/:id` | Private | Get single sale |
| POST | `/` | Private | Create sale |
| GET | `/analytics` | Private | Get sales analytics |

**Query Parameters**: `store`, `startDate`, `endDate`, `page`, `limit`

### 👥 Customers (`/api/customers`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | Get all customers |
| GET | `/:id` | Private | Get single customer |
| POST | `/` | Private | Create customer |
| PUT | `/:id` | Private | Update customer |
| DELETE | `/:id` | Private | Delete customer |

### 🚚 Suppliers (`/api/suppliers`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | Get all suppliers |
| GET | `/:id` | Private | Get single supplier |
| POST | `/` | Private | Create supplier |
| PUT | `/:id` | Private | Update supplier |
| DELETE | `/:id` | Private | Delete supplier |

### 📑 Purchase Orders (`/api/purchase-orders`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | Get all purchase orders |
| GET | `/:id` | Private | Get single purchase order |
| POST | `/` | Private | Create purchase order |
| PUT | `/:id/receive` | Private | Receive purchase order |
| PUT | `/:id` | Private | Update purchase order |

### 🔄 Stock Transfers (`/api/transfers`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | Get all transfers |
| GET | `/:id` | Private | Get single transfer |
| POST | `/` | Private | Create transfer |
| PUT | `/:id/complete` | Private | Complete transfer |

### 📈 Analytics (`/api/analytics`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/dashboard` | Private | Get dashboard analytics |
| GET | `/revenue-chart` | Private | Get revenue chart data |
| GET | `/category-breakdown` | Private | Get category breakdown |

### 👤 Users (`/api/users`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Admin/Manager | Get all users |
| GET | `/:id` | Private | Get single user |
| PUT | `/:id` | Admin | Update user |
| DELETE | `/:id` | Admin | Delete user |

## 🎯 Key Features

### ✅ FIFO Batch Management
- Automatic stock deduction from oldest batches first
- FEFO (First Expiry First Out) for perishable goods
- Expiry date tracking and alerts

### ✅ Automatic Inventory Updates
- Creating batches → Increases inventory
- Making sales → Decreases inventory
- Receiving purchase orders → Creates batches + Updates inventory

### ✅ Low Stock Alerts
- Configurable threshold per product
- Real-time monitoring
- Dashboard notifications

### ✅ Multi-Store Support
- Track inventory per store
- Transfer stock between stores
- Store-specific analytics

### ✅ Comprehensive Analytics
- Revenue and profit tracking
- Category-wise breakdown
- Top products by revenue
- Inventory statistics
- Expiry alerts

## 📝 Sample Request/Response

### Create a Sale

**Request:**
```json
POST /api/sales
{
  "store": "65f1234567890abcdef12345",
  "cashier": "65f1234567890abcdef12346",
  "items": [
    {
      "product": "65f1234567890abcdef12347",
      "quantity": 2,
      "sellingPrice": 35.00,
      "costPrice": 25.00
    }
  ],
  "paymentMethod": "cash",
  "discount": 5,
  "tax": 5.60
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sale completed successfully",
  "data": {
    "sale": {
      "_id": "...",
      "invoiceNumber": "INV-20260405-1234",
      "items": [...],
      "totalAmount": 70,
      "discount": 5,
      "tax": 5.60,
      "finalAmount": 70.60,
      "paymentMethod": "cash"
    }
  }
}
```

## ⚠️ Error Handling

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional validation errors
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🔧 Testing with Postman

1. Import `postman_collection.json` into Postman
2. Run login endpoint to automatically set token
3. All subsequent requests will use the saved token
4. Replace placeholder IDs (STORE_ID, PRODUCT_ID, etc.) with actual values

## 📊 Database Collections

MongoDB collections created automatically:
- `users` - System users
- `stores` - Store locations
- `categories` - Product categories
- `products` - Products for sale
- `inventories` - Stock levels
- `batches` - Product batches
- `sales` - Sales transactions
- `customers` - Customer records
- `suppliers` - Supplier records
- `purchaseorders` - Purchase orders
- `stocktransfers` - Stock transfers

## 🎨 Database Indexes

Optimized indexes for performance:
- Product SKU (unique)
- User email (unique)
- Category name (unique)
- Inventory (product + store compound unique)
- Batch queries (product + store + createdAt)
- Sale invoice number (unique)

## 🚀 Production Checklist

- [ ] Change JWT_SECRET to strong random value
- [ ] Set NODE_ENV=production
- [ ] Use MongoDB Atlas or hosted database
- [ ] Enable HTTPS/SSL
- [ ] Add rate limiting middleware
- [ ] Configure CORS properly
- [ ] Set up error logging
- [ ] Use PM2 for process management
- [ ] Regular database backups
- [ ] Monitor server resources

## 📞 Support

For issues or questions:
- Check README.md for detailed documentation
- Review QUICK_START.md for setup guide
- Check Postman collection for request examples
- Review MongoDB and Express documentation

## 🎉 You're All Set!

The backend is running and ready to connect with your frontend POS application!
