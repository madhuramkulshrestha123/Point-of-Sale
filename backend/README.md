# POS System Backend

A comprehensive backend API for a Point of Sale (POS) system built with Node.js, Express, and MongoDB.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control
- 📦 **Product Management** - CRUD operations for products with categories
- 🏪 **Multi-store Support** - Manage multiple stores
- 📊 **Inventory Management** - Track stock levels with low stock alerts
- 🔄 **Batch Tracking** - FIFO/FEFO batch management with expiry tracking
- 🛒 **Sales Processing** - Complete sales transactions with automatic inventory updates
- 👥 **Customer Management** - CRM with loyalty points
- 🚚 **Supplier Management** - Manage suppliers and purchase orders
- 📑 **Purchase Orders** - Automated stock replenishment
- 🔄 **Stock Transfers** - Transfer inventory between stores
- 📈 **Analytics** - Comprehensive dashboard with revenue, profit, and inventory insights

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, bcryptjs
- **Validation**: express-validator
- **Logging**: Morgan

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)

### Setup

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pos_system
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Start MongoDB service:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

5. Run the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## Database Models

### Core Models

- **User** - System users (admin, manager, cashier)
- **Store** - Store locations
- **Category** - Product categories
- **Product** - Products/items for sale
- **Inventory** - Stock levels per store
- **Batch** - Product batches with expiry dates
- **Sale** - Sales transactions
- **Customer** - Customer information
- **Supplier** - Supplier details
- **PurchaseOrder** - Purchase orders for restocking
- **StockTransfer** - Inter-store stock transfers

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin/Manager)
- `PUT /api/products/:id` - Update product (Admin/Manager)
- `DELETE /api/products/:id` - Delete product (Admin)

### Inventory
- `GET /api/inventory` - Get all inventory
- `GET /api/inventory/low-stock` - Get low stock items
- `GET /api/inventory/product/:productId/store/:storeId` - Get product inventory
- `PUT /api/inventory/:id` - Update inventory

### Batches
- `GET /api/batches` - Get all batches
- `GET /api/batches/expiring/:days` - Get expiring batches
- `POST /api/batches` - Create batch
- `PUT /api/batches/:id` - Update batch

### Sales
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get single sale
- `POST /api/sales` - Create sale
- `GET /api/sales/analytics` - Get sales analytics

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get single supplier
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

### Purchase Orders
- `GET /api/purchase-orders` - Get all purchase orders
- `GET /api/purchase-orders/:id` - Get single purchase order
- `POST /api/purchase-orders` - Create purchase order
- `PUT /api/purchase-orders/:id/receive` - Receive purchase order
- `PUT /api/purchase-orders/:id` - Update purchase order

### Stock Transfers
- `GET /api/transfers` - Get all transfers
- `GET /api/transfers/:id` - Get single transfer
- `POST /api/transfers` - Create transfer
- `PUT /api/transfers/:id/complete` - Complete transfer

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/revenue-chart` - Get revenue chart data
- `GET /api/analytics/category-breakdown` - Get category breakdown

### Stores
- `GET /api/stores` - Get all stores
- `GET /api/stores/:id` - Get single store
- `POST /api/stores` - Create store (Admin)
- `PUT /api/stores/:id` - Update store (Admin)
- `DELETE /api/stores/:id` - Delete store (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Admin/Manager)
- `PUT /api/categories/:id` - Update category (Admin/Manager)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Users
- `GET /api/users` - Get all users (Admin/Manager)
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

## Key Features Explained

### FIFO Batch Deduction
When creating a sale, the system automatically deducts stock from the oldest batches first (FEFO - First Expiry First Out), ensuring proper inventory rotation.

### Automatic Inventory Updates
- Creating batches automatically increases inventory
- Making sales automatically decreases inventory
- Receiving purchase orders creates batches and updates inventory

### Low Stock Alerts
The system tracks low stock thresholds and provides alerts when inventory falls below the defined levels.

### Expiry Tracking
Batches track expiry dates, and the system provides alerts for products expiring within a specified timeframe.

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Role-Based Access Control

- **Admin** - Full access to all features
- **Manager** - Access to most features except critical admin operations
- **Cashier** - Access to sales and basic product lookup

## Sample Requests

### Create a Sale

```json
POST /api/sales
{
  "store": "65f1234567890abcdef12345",
  "cashier": "65f1234567890abcdef12346",
  "items": [
    {
      "product": "65f1234567890abcdef12347",
      "quantity": 2,
      "sellingPrice": 50.00,
      "costPrice": 30.00
    }
  ],
  "paymentMethod": "cash",
  "discount": 5,
  "tax": 8.50
}
```

### Create a Batch

```json
POST /api/batches
{
  "product": "65f1234567890abcdef12347",
  "store": "65f1234567890abcdef12345",
  "batchNumber": "BATCH-001",
  "quantity": 100,
  "purchasePrice": 30.00,
  "expiryDate": "2025-12-31"
}
```

## Error Handling

All responses follow this format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [] // Optional validation errors
}
```

## Development

Run in development mode with auto-reload:
```bash
npm run dev
```

## Production

Start in production mode:
```bash
npm start
```

Make sure to:
- Set `NODE_ENV=production`
- Use a strong `JWT_SECRET`
- Configure proper MongoDB connection string
- Set up HTTPS
- Enable rate limiting (add middleware if needed)

## License

ISC
