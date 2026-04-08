const mongoose = require('mongoose');
const Customer = require('./models/Customer.model');
const Sale = require('./models/Sale.model');
const dotenv = require('dotenv');

dotenv.config();

const fixCustomerData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');

    // Get all customers
    const customers = await Customer.find({});
    console.log(`\nFound ${customers.length} customers\n`);

    for (const customer of customers) {
      console.log(`\nProcessing: ${customer.name} (${customer._id})`);

      // Get all sales for this customer
      const sales = await Sale.find({ customer: customer._id });
      console.log(`  Found ${sales.length} sales`);

      // Calculate totals
      let totalOrders = sales.length;
      let totalSpent = 0;
      let totalPaid = 0;
      let loyaltyPoints = 0;

      for (const sale of sales) {
        totalSpent += sale.finalAmount || 0;
        totalPaid += sale.amountPaid || 0;
        
        // Calculate loyalty points (1 point per ₹100)
        loyaltyPoints += Math.floor((sale.finalAmount || 0) / 100);
      }

      const totalDue = totalSpent - totalPaid;

      console.log(`  Total Orders: ${totalOrders}`);
      console.log(`  Total Spent: ₹${totalSpent.toFixed(2)}`);
      console.log(`  Total Paid: ₹${totalPaid.toFixed(2)}`);
      console.log(`  Total Due: ₹${totalDue.toFixed(2)}`);
      console.log(`  Loyalty Points: ${loyaltyPoints}`);

      // Update customer
      customer.totalOrders = totalOrders;
      customer.totalSpent = totalSpent;
      customer.totalPaid = totalPaid;
      customer.totalDue = Math.max(0, totalDue);
      customer.loyaltyPoints = loyaltyPoints;
      
      await customer.save();
      console.log(`  ✓ Updated successfully`);
    }

    console.log('\n✅ Customer data migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixCustomerData();
