const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product.model');
const Inventory = require('./models/Inventory.model');
const Batch = require('./models/Batch.model');

dotenv.config();

async function resetInventory() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear all inventory data
    console.log('🗑️  Clearing inventory data...');
    const inventoryResult = await Inventory.deleteMany({});
    console.log(`✓ Deleted ${inventoryResult.deletedCount} inventory records`);

    // Clear all batch data
    console.log('🗑️  Clearing batch data...');
    const batchResult = await Batch.deleteMany({});
    console.log(`✓ Deleted ${batchResult.deletedCount} batch records`);

    // Clear all product data
    console.log('🗑️  Clearing product data...');
    const productResult = await Product.deleteMany({});
    console.log(`✓ Deleted ${productResult.deletedCount} product records`);

    console.log('\n✅ All inventory data has been reset successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Products deleted: ${productResult.deletedCount}`);
    console.log(`- Batches deleted: ${batchResult.deletedCount}`);
    console.log(`- Inventory records deleted: ${inventoryResult.deletedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting inventory:', error);
    process.exit(1);
  }
}

// Run the reset
resetInventory();
