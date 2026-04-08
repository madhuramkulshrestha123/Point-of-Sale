const mongoose = require('mongoose');
const Inventory = require('./models/Inventory.model');
const Batch = require('./models/Batch.model');
require('dotenv').config();

async function removeStoreFromInventory() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all existing inventory and batches
    await Inventory.deleteMany({});
    await Batch.deleteMany({});
    console.log('✅ Cleared old inventory and batches');

    // Get all products
    const Product = require('./models/Product.model');
    const products = await Product.find();
    console.log(`📦 Found ${products.length} products`);

    // Create new inventory and batches without store
    for (const product of products) {
      await Inventory.create({
        product: product._id,
        totalQuantity: 100,
        lowStockThreshold: 10,
        lastRestocked: new Date(),
      });

      await Batch.create({
        product: product._id,
        batchNumber: `BATCH-${product.sku}`,
        quantity: 100,
        purchasePrice: product.costPrice,
        expiryDate: new Date('2027-12-31'),
        manufactureDate: new Date(),
      });
    }

    console.log(`✅ Created ${products.length} inventory records and ${products.length} batches`);
    console.log('\n✅ Fix complete! Try making a sale now.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

removeStoreFromInventory();
