const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category.model');

dotenv.config();

async function resetCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear all category data
    console.log('🗑️  Clearing category data...');
    const result = await Category.deleteMany({});
    console.log(`✓ Deleted ${result.deletedCount} category records`);

    console.log('\n✅ All category data has been reset successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Categories deleted: ${result.deletedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting categories:', error);
    process.exit(1);
  }
}

// Run the reset
resetCategories();
