require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const Product = require('./models/Product.model');
const Category = require('./models/Category.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pos_system';

async function fixExistingProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all categories
    const categories = await Category.find({});
    console.log(`\n📂 Found ${categories.length} categories:`);
    categories.forEach(cat => console.log(`   - ${cat.name}`));

    // Get all products
    const products = await Product.find({});
    console.log(`\n📦 Found ${products.length} products`);

    // Create a map of category ID to category name
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat._id.toString()] = cat.name;
    });

    // Update products that have category IDs
    let updatedCount = 0;
    for (const product of products) {
      const categoryId = product.category;
      
      // Check if category is an ObjectId or ObjectId string (24 character hex string)
      const isObjectIdString = typeof categoryId === 'string' && categoryId.match(/^[0-9a-fA-F]{24}$/);
      
      if (categoryId && (typeof categoryId === 'object' || isObjectIdString)) {
        const idToString = typeof categoryId === 'object' ? categoryId.toString() : categoryId;
        const categoryName = categoryMap[idToString];
        
        if (categoryName) {
          console.log(`\n🔄 Updating product: ${product.name}`);
          console.log(`   Old category: ${idToString} (ID)`);
          console.log(`   New category: ${categoryName} (Name)`);
          
          await Product.findByIdAndUpdate(product._id, {
            category: categoryName
          });
          
          updatedCount++;
        } else {
          console.warn(`\n⚠️  Warning: Product "${product.name}" has unknown category ID: ${idToString}`);
        }
      } else if (categoryId && typeof categoryId === 'string') {
        console.log(`\n✓ Product "${product.name}" already has category name: "${categoryId}"`);
      } else {
        console.log(`\n⚠️  Product "${product.name}" has no category`);
      }
    }

    console.log(`\n✅ Successfully updated ${updatedCount} out of ${products.length} products`);
    console.log('\n🎉 Migration complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

fixExistingProducts();
