# POS Backend Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Applications                     │
│  (React POS, Mobile App, Admin Dashboard, etc.)             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         │ REST API Calls
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend Server                           │
│                   (Node.js + Express)                       │
│                   Port: 5000                                 │
├─────────────────────────────────────────────────────────────┤
│                      Middleware Layer                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Helmet  │  │   CORS   │  │ Morgan   │  │ Body     │   │
│  │ Security │  │          │  │ Logging  │  │ Parser   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Authentication Middleware (JWT)              │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      Routes Layer                            │
│  /auth  /products  /sales  /inventory  /analytics  ...      │
├─────────────────────────────────────────────────────────────┤
│                   Controllers Layer                          │
│  Business Logic & Request Handling                          │
├─────────────────────────────────────────────────────────────┤
│                     Models Layer                             │
│  Mongoose Schemas & Database Operations                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Mongoose ODM
                         │ MongoDB Queries
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                          │
│                 pos_system                                   │
├─────────────────────────────────────────────────────────────┤
│ Collections:                                                 │
│ • users         • products      • sales                     │
│ • stores        • inventories   • customers                 │
│ • categories    • batches       • suppliers                 │
│ • purchaseorders • stocktransfers                            │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Sale Transaction Flow

```
Client Request (POST /api/sales)
         │
         ▼
┌─────────────────┐
│  Auth Check     │ → Verify JWT Token
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validate Input  │ → Check required fields
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check Inventory │ → Verify stock availability
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ FIFO Batch      │ → Deduct from oldest batches
│ Deduction       │    (FEFO for expiry)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update          │ → Decrease inventory count
│ Inventory       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create Sale     │ → Save transaction
│ Record          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Calculate       │ → Revenue - Cost = Profit
│ Analytics       │
└────────┬────────┘
         │
         ▼
    Response
   {success, sale}
```

### Purchase Order to Inventory Flow

```
Create Purchase Order
         │
         ▼
Status: PENDING
         │
         │ Receive Order (PUT /receive)
         ▼
┌─────────────────┐
│ For Each Item:  │
│ 1. Create Batch │ → New batch with purchase price
│ 2. Update Inv.  │ → Increase total quantity
└────────┬────────┘
         │
         ▼
Status: RECEIVED
         │
         ▼
Inventory Updated
```

### Stock Transfer Flow

```
Create Transfer Request
         │
         ▼
Status: PENDING
         │
         │ Complete Transfer (PUT /complete)
         ▼
┌──────────────────────┐
│ From Store Inventory │ → Decrease quantity
│ To Store Inventory   │ → Increase quantity
└──────────┬───────────┘
           │
           ▼
  Status: COMPLETED
```

## Module Dependencies

```
┌─────────────────────────────────────────────────────┐
│                 Core Modules                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│  User ──────────┐                                   │
│    │            │                                   │
│    ├─ has ── Store                                 │
│    │            │                                   │
│    └─ role ──> [admin/manager/cashier]             │
│                                                      │
│  Product ───────┐                                   │
│    │            │                                   │
│    ├─ belongs to ── Category                       │
│    │            │                                   │
│    └─ has many ── Batches                          │
│                                                      │
│  Inventory ─────┐                                   │
│    │            │                                   │
│    ├─ tracks ── Product                            │
│    │            │                                   │
│    └─ in ── Store                                  │
│                                                      │
│  Sale ──────────┐                                   │
│    │            │                                   │
│    ├─ made by ── Cashier (User)                    │
│    │            │                                   │
│    ├─ at ── Store                                  │
│    │            │                                   │
│    ├─ to ── Customer                               │
│    │            │                                   │
│    └─ contains ── SaleItems (Products)             │
│                                                      │
│  Batch ─────────┐                                   │
│    │            │                                   │
│    ├─ of ── Product                                │
│    │            │                                   │
│    └─ in ── Store                                  │
│                                                      │
│  PurchaseOrder ─┐                                   │
│    │            │                                   │
│    ├─ from ── Supplier                             │
│    │            │                                   │
│    ├─ to ── Store                                  │
│    │            │                                   │
│    ├─ created by ── User                           │
│    │            │                                   │
│    └─ contains ── PurchaseItems (Products)         │
│                                                      │
│  StockTransfer ─┐                                   │
│    │            │                                   │
│    ├─ from ── Store                                │
│    │            │                                   │
│    ├─ to ── Store                                  │
│    │            │                                   │
│    └─ by ── User                                   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. POST /auth/login
     │    {email, password}
     ▼
┌─────────────────┐
│  Auth Controller │
└────────┬────────┘
         │
         │ 2. Verify credentials
         ▼
┌─────────────────┐
│  Compare Hash   │ → bcrypt.compare()
└────────┬────────┘
         │
         │ 3. Generate JWT
         ▼
┌─────────────────┐
│  jwt.sign()     │ → {id, exp}
└────────┬────────┘
         │
         │ 4. Return token
         ▼
     Client
         │
         │ 5. Store token
         │
         │ 6. Next request:
         │    Authorization: Bearer TOKEN
         ▼
┌─────────────────┐
│ auth.middleware │ → jwt.verify()
└────────┬────────┘
         │
         │ 7. Attach user to request
         ▼
    req.user = userData
         │
         ▼
    Protected Route
```

## API Layer Architecture

```
Request
   │
   ▼
┌──────────┐
│  Routes  │ → Define endpoints
└────┬─────┘
     │
     ▼
┌────────────┐
│Controllers │ → Business logic
└─────┬──────┘
      │
      ▼
┌──────────┐
│ Models   │ → Database ops
└────┬─────┘
     │
     ▼
  MongoDB
```

## Database Schema Relationships

```
User
 ├── store (ref: Store)
 └── role (enum)

Store
 └── has many Products (through Inventory)

Category
 └── has many Products

Product
 ├── category (ref: Category)
 ├── has many Batches
 └── has many Inventories

Inventory
 ├── product (ref: Product)
 └── store (ref: Store)

Batch
 ├── product (ref: Product)
 └── store (ref: Store)

Sale
 ├── store (ref: Store)
 ├── cashier (ref: User)
 ├── customer (ref: Customer)
 └── items[].product (ref: Product)

Supplier
 └── has many PurchaseOrders

PurchaseOrder
 ├── supplier (ref: Supplier)
 ├── store (ref: Store)
 ├── createdBy (ref: User)
 └── items[].product (ref: Product)

StockTransfer
 ├── fromStore (ref: Store)
 ├── toStore (ref: Store)
 ├── transferredBy (ref: User)
 └── items[].product (ref: Product)
```

## Key Algorithms

### FIFO Batch Deduction
```javascript
// Get batches sorted by expiry (oldest first)
const batches = await Batch.find({
  product: productId,
  store: storeId,
  quantity: { $gt: 0 }
}).sort({ expiryDate: 1, createdAt: 1 });

let remaining = orderQuantity;
for (const batch of batches) {
  if (remaining <= 0) break;
  
  const deduct = Math.min(batch.quantity, remaining);
  batch.quantity -= deduct;
  remaining -= deduct;
  
  await batch.save();
}
```

### Profit Calculation
```javascript
profit = Σ((sellingPrice - costPrice) × quantity)
margin = (profit / revenue) × 100
```

### Low Stock Detection
```javascript
Inventory.find({
  $expr: { $lt: ['$totalQuantity', '$lowStockThreshold'] }
})
```

---

**Backend Status**: ✅ Fully Functional
**Architecture**: Modular Monolith (SaaS-ready)
**Database**: MongoDB with Mongoose ODM
**Scalability**: Ready for microservices split
