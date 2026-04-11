require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

console.log('MONGO_URI from env:', process.env.MONGO_URI ? 'Found' : 'Not found');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pos_system';

async function checkDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections in database:');
    collections.forEach(col => console.log(`   - ${col.name}`));

    // Check products
    const productsCollection = await mongoose.connection.db.collection('products');
    const products = await productsCollection.find({}).toArray();
    console.log(`\n📦 Total products: ${products.length}`);
    
    if (products.length > 0) {
      console.log('\nSample products:');
      products.slice(0, 3).forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.name}`);
        console.log(`   SKU: ${p.sku}`);
        console.log(`   Category: ${p.category} (type: ${typeof p.category})`);
        console.log(`   Stock: ${p.stockQuantity}`);
      });
    }

    // Check categories
    const categoriesCollection = await mongoose.connection.db.collection('categories');
    const categories = await categoriesCollection.find({}).toArray();
    console.log(`\n📂 Total categories: ${categories.length}`);
    
    if (categories.length > 0) {
      console.log('\nCategories:');
      categories.forEach((c, i) => {
        console.log(`${i + 1}. ${c.name}`);
        console.log(`   ID: ${c._id}`);
        console.log(`   Image: ${c.image || 'none'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

checkDatabase();
