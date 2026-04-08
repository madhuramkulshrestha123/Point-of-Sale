const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User.model');
const Store = require('./models/Store.model');
const Category = require('./models/Category.model');
const Product = require('./models/Product.model');
const Inventory = require('./models/Inventory.model');
const Batch = require('./models/Batch.model');
const Customer = require('./models/Customer.model');
const Supplier = require('./models/Supplier.model');

dotenv.config();

const sampleData = {
  stores: [
    {
      name: 'Main Store',
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      },
      phone: '555-0123',
      email: 'mainstore@pos.com',
    },
    {
      name: 'Downtown Branch',
      address: {
        street: '456 Downtown Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        country: 'USA',
      },
      phone: '555-0456',
      email: 'downtown@pos.com',
    },
  ],
  categories: [
    { name: 'Motor Oil', description: 'Engine oils and lubricants' },
    { name: 'Filters', description: 'Oil filters, air filters, fuel filters' },
    { name: 'Brake System', description: 'Brake pads, rotors, brake fluid' },
    { name: 'Battery', description: 'Car batteries and accessories' },
    { name: 'Tires', description: 'Car tires and wheels' },
  ],
  products: [
    {
      name: 'Synthetic Motor Oil 5W-30',
      sku: 'OIL-5W30-001',
      brand: 'Premium',
      mrp: 40.00,
      costPrice: 25.00,
      sellingPrice: 35.00,
      vehicleCompatibility: ['Honda', 'Toyota', 'Ford', 'BMW'],
    },
    {
      name: 'Conventional Motor Oil 10W-40',
      sku: 'OIL-10W40-002',
      brand: 'Standard',
      mrp: 30.00,
      costPrice: 18.00,
      sellingPrice: 25.00,
      vehicleCompatibility: ['Honda', 'Toyota', 'Ford'],
    },
    {
      name: 'Oil Filter Premium',
      sku: 'FLT-OIL-001',
      brand: 'FilterPro',
      mrp: 18.00,
      costPrice: 8.00,
      sellingPrice: 15.00,
      vehicleCompatibility: ['Universal'],
    },
    {
      name: 'Air Filter',
      sku: 'FLT-AIR-001',
      brand: 'FilterPro',
      mrp: 25.00,
      costPrice: 12.00,
      sellingPrice: 22.00,
      vehicleCompatibility: ['Honda Civic', 'Toyota Corolla'],
    },
    {
      name: 'Brake Pad Set - Front',
      sku: 'BRK-PAD-FRT-001',
      brand: 'SafeStop',
      mrp: 75.00,
      costPrice: 35.00,
      sellingPrice: 65.00,
      vehicleCompatibility: ['Honda', 'Toyota'],
    },
    {
      name: 'Car Battery 12V',
      sku: 'BAT-12V-001',
      brand: 'PowerMax',
      mrp: 150.00,
      costPrice: 80.00,
      sellingPrice: 120.00,
      vehicleCompatibility: ['Universal'],
    },
  ],
  customers: [
    {
      name: 'John Doe',
      phone: '555-1001',
      email: 'john.doe@email.com',
      loyaltyPoints: 150,
      totalPurchases: 1500,
    },
    {
      name: 'Jane Smith',
      phone: '555-1002',
      email: 'jane.smith@email.com',
      loyaltyPoints: 200,
      totalPurchases: 2000,
    },
    {
      name: 'Mike Johnson',
      phone: '555-1003',
      email: 'mike.j@email.com',
      loyaltyPoints: 75,
      totalPurchases: 750,
    },
  ],
  suppliers: [
    {
      name: 'Auto Parts Wholesale Inc.',
      contactPerson: 'Robert Brown',
      phone: '555-2001',
      email: 'robert@autopartswholesale.com',
      address: {
        street: '789 Supplier Blvd',
        city: 'Newark',
        state: 'NJ',
        zipCode: '07101',
        country: 'USA',
      },
      paymentTerms: 'Net 30',
      rating: 4.5,
    },
    {
      name: 'Oil Distributors LLC',
      contactPerson: 'Sarah Wilson',
      phone: '555-2002',
      email: 'sarah@oildistributors.com',
      address: {
        street: '321 Oil Road',
        city: 'Edison',
        state: 'NJ',
        zipCode: '08817',
        country: 'USA',
      },
      paymentTerms: 'Net 15',
      rating: 4.8,
    },
  ],
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Store.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Inventory.deleteMany({}),
      Batch.deleteMany({}),
      Customer.deleteMany({}),
      Supplier.deleteMany({}),
    ]);

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      businessName: 'AutoParts POS',
      ownerName: 'Admin User',
      email: 'admin@pos.com',
      phone: '555-0100',
      pin: '1234',
      role: 'admin',
    });
    console.log(`✓ Admin user created: ${adminUser.email}`);

    // Create stores
    console.log('🏪 Creating stores...');
    const stores = await Store.insertMany(sampleData.stores);
    console.log(`✓ Created ${stores.length} stores`);

    // Create categories
    console.log('📂 Creating categories...');
    const categories = await Category.insertMany(sampleData.categories);
    console.log(`✓ Created ${categories.length} categories`);

    // Create products with category references
    console.log('📦 Creating products...');
    const productsWithCategories = sampleData.products.map((product, index) => ({
      ...product,
      category: categories[index % categories.length]._id,
      barcode: `BAR${String(index + 1).padStart(6, '0')}`,
    }));
    const products = await Product.insertMany(productsWithCategories);
    console.log(`✓ Created ${products.length} products`);

    // Create inventory and batches for each product in main store
    console.log('📊 Creating inventory and batches...');
    const mainStore = stores[0];
    const batches = [];
    const inventories = [];

    for (const product of products) {
      // Create batch
      const batch = await Batch.create({
        product: product._id,
        store: mainStore._id,
        batchNumber: `BATCH-${product.sku}`,
        quantity: 100,
        purchasePrice: product.costPrice,
        expiryDate: new Date('2027-12-31'),
        manufactureDate: new Date(),
      });
      batches.push(batch);

      // Create inventory
      const inventory = await Inventory.create({
        product: product._id,
        store: mainStore._id,
        totalQuantity: 100,
        lowStockThreshold: 10,
        lastRestocked: new Date(),
      });
      inventories.push(inventory);
    }
    console.log(`✓ Created ${batches.length} batches and ${inventories.length} inventory records`);

    // Create second store inventory
    const secondStore = stores[1];
    for (const product of products.slice(0, 3)) {
      await Batch.create({
        product: product._id,
        store: secondStore._id,
        batchNumber: `BATCH-${product.sku}-S2`,
        quantity: 50,
        purchasePrice: product.costPrice,
        expiryDate: new Date('2027-12-31'),
      });

      await Inventory.create({
        product: product._id,
        store: secondStore._id,
        totalQuantity: 50,
        lowStockThreshold: 10,
        lastRestocked: new Date(),
      });
    }
    console.log('✓ Populated second store with inventory');

    // Create customers
    console.log('👥 Creating customers...');
    const customers = await Customer.insertMany(sampleData.customers);
    console.log(`✓ Created ${customers.length} customers`);

    // Create suppliers
    console.log('🚚 Creating suppliers...');
    const suppliers = await Supplier.insertMany(sampleData.suppliers);
    console.log(`✓ Created ${suppliers.length} suppliers`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: admin123`);
    console.log('\n📋 Sample Data Summary:');
    console.log(`- Stores: ${stores.length}`);
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Products: ${products.length}`);
    console.log(`- Customers: ${customers.length}`);
    console.log(`- Suppliers: ${suppliers.length}`);
    console.log(`- Batches: ${batches.length + 3}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeder
seedDatabase();
