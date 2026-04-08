const mongoose = require('mongoose');
const User = require('./models/User.model');
require('dotenv').config();

async function updatePin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the user by email
    const user = await User.findOne({ email: 'madhuram@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('Found user:', user.businessName);

    // Update PIN to 1234
    user.pin = '1234';
    await user.save();

    console.log('✅ PIN updated successfully!');
    console.log('You can now login with PIN: 1234');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updatePin();
