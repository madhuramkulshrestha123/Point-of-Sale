const mongoose = require('mongoose');
const Sale = require('../models/Sale.model');
const Product = require('../models/Product.model');
const Inventory = require('../models/Inventory.model');
const Batch = require('../models/Batch.model');
const Customer = require('../models/Customer.model');

// Generate invoice number - sequential starting from 000001
const generateInvoiceNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Find the last sale to get the next sequence number
  const lastSale = await Sale.findOne()
    .sort({ createdAt: -1 })
    .select('invoiceNumber')
    .lean();
  
  let sequenceNumber = 1;
  if (lastSale && lastSale.invoiceNumber) {
    // Extract the sequence number from the last invoice (format: INV-YYYYMMDD-NNNNNN)
    const parts = lastSale.invoiceNumber.split('-');
    if (parts.length === 3) {
      sequenceNumber = parseInt(parts[2]) + 1;
    }
  }
  
  // Format: INV-YYYYMMDD-000001
  const sequenceStr = String(sequenceNumber).padStart(6, '0');
  return `INV-${year}${month}-${sequenceStr}`;
};

// @desc    Create a sale
// @route   POST /api/sales
// @access  Private
exports.createSale = async (req, res) => {
  try {
    const { customer, cashier, items, paymentMethod, discount, tax, notes, isPending } = req.body;

    console.log('Creating sale with data:', JSON.stringify(req.body, null, 2));

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required',
      });
    }

    let totalAmount = 0;
    const saleItems = [];

    // Process each item
    for (const item of items) {
      console.log(`Processing item: ${item.product}, quantity: ${item.quantity}`);
      
      const product = await Product.findById(item.product);

      if (!product) {
        console.error(`Product not found: ${item.product}`);
        return res.status(404).json({
          success: false,
          message: `Product ${item.product} not found`,
        });
      }

      // Get inventory for this product (no store filter)
      let inventory = await Inventory.findOne({
        product: item.product,
      });

      console.log(`Inventory for ${product.name}:`, inventory ? `Found - Qty: ${inventory.totalQuantity}` : 'Not found');
      
      // If no inventory found, create one using product's stockQuantity
      if (!inventory) {
        console.log(`Creating inventory record for ${product.name} with stock: ${product.stockQuantity}`);
        
        // If product has no stock, return error
        if (!product.stockQuantity || product.stockQuantity <= 0) {
          return res.status(400).json({
            success: false,
            message: `Out of stock for ${product.name}. Available: 0`,
          });
        }
        
        // Create inventory record from product stock
        inventory = await Inventory.create({
          product: item.product,
          totalQuantity: product.stockQuantity,
          minStock: product.reorderLevel || 10,
        });
        
        console.log(`Created inventory for ${product.name}: ${product.stockQuantity}`);
      }

      if (inventory.totalQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${inventory.totalQuantity}`,
        });
      }

      // FIFO: Get batches for this product (oldest first, no store filter)
      const batches = await Batch.find({
        product: item.product,
        quantity: { $gt: 0 },
        isActive: true,
      })
        .sort({ expiryDate: 1, createdAt: 1 }); // FEFO - First Expiry First Out

      let remainingQuantity = item.quantity;
      const sellingPrice = item.sellingPrice || product.sellingPrice;
      const costPrice = item.costPrice || product.costPrice;
      let itemSubtotal = 0;

      // Deduct from batches using FIFO
      for (const batch of batches) {
        if (remainingQuantity <= 0) break;

        const deductFromBatch = Math.min(batch.quantity, remainingQuantity);
        batch.quantity -= deductFromBatch;
        remainingQuantity -= deductFromBatch;

        if (batch.quantity === 0) {
          batch.isActive = false;
        }

        await batch.save();
      }

      // Update inventory
      inventory.totalQuantity -= item.quantity;
      inventory.updatedAt = Date.now();
      await inventory.save();

      // Also update product stockQuantity
      product.stockQuantity = inventory.totalQuantity;
      await product.save();

      itemSubtotal = sellingPrice * item.quantity;
      totalAmount += itemSubtotal;

      saleItems.push({
        product: item.product,
        productName: product.name,
        quantity: item.quantity,
        sellingPrice,
        costPrice,
        discount: item.discount || 0,
        subtotal: itemSubtotal,
        taxRate: product.gstRate || 18, // Store the product's tax rate
      });
    }

    // Calculate final amount
    const discountAmount = discount || 0;
    const taxAmount = tax || 0;
    const finalAmount = totalAmount - discountAmount + taxAmount;

    // Generate sequential invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Determine payment status
    const paymentStatus = isPending ? 'pending' : 'paid';
    const amountPaid = isPending ? 0 : finalAmount;

    // Create sale
    const sale = await Sale.create({
      invoiceNumber,
      customer,
      cashier,
      items: saleItems,
      totalAmount,
      discount: discountAmount,
      tax: taxAmount,
      finalAmount,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus,
      amountPaid,
      notes,
    });

    // Update customer statistics if customer is provided
    if (customer) {
      const customerDoc = await Customer.findById(customer);
      if (customerDoc) {
        // Update customer statistics
        customerDoc.totalOrders = (customerDoc.totalOrders || 0) + 1;
        customerDoc.totalSpent = (customerDoc.totalSpent || 0) + finalAmount;
        customerDoc.totalPaid = (customerDoc.totalPaid || 0) + amountPaid;
        customerDoc.totalDue = (customerDoc.totalDue || 0) + (finalAmount - amountPaid);
        customerDoc.lastPurchaseDate = new Date();
        
        // Update loyalty points (1 point per ₹100 spent)
        const pointsEarned = Math.floor(finalAmount / 100);
        customerDoc.loyaltyPoints = (customerDoc.loyaltyPoints || 0) + pointsEarned;
        
        await customerDoc.save();
      }
    }

    res.status(201).json({
      success: true,
      message: isPending ? 'Bill saved as pending' : 'Sale completed successfully',
      data: { sale },
    });
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating sale',
      error: error.message,
    });
  }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
exports.getSales = async (req, res) => {
  try {
    const { store, startDate, endDate, page = 1, limit = 50 } = req.query;

    let query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sales = await Sale.find(query)
      .populate('customer')
      .populate('cashier', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Sale.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        sales,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      },
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales',
      error: error.message,
    });
  }
};

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Private
exports.getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer')
      .populate('cashier', 'name email')
      .populate('items.product');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { sale },
    });
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sale',
      error: error.message,
    });
  }
};

// @desc    Get sales analytics
// @route   GET /api/sales/analytics
// @access  Private
exports.getSalesAnalytics = async (req, res) => {
  try {
    const { store, startDate, endDate } = req.query;

    let query = {};

    if (store) query.store = store;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const analytics = await Sale.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$finalAmount' },
          totalDiscount: { $sum: '$discount' },
          totalTax: { $sum: '$tax' },
          averageOrderValue: { $avg: '$finalAmount' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        analytics: analytics[0] || {
          totalSales: 0,
          totalRevenue: 0,
          totalDiscount: 0,
          totalTax: 0,
          averageOrderValue: 0,
        },
      },
    });
  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales analytics',
      error: error.message,
    });
  }
};
