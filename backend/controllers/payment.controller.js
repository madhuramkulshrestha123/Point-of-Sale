const mongoose = require('mongoose');
const Payment = require('../models/Payment.model');
const Sale = require('../models/Sale.model');
const Customer = require('../models/Customer.model');

// @desc    Create a payment
// @route   POST /api/payments
// @access  Private
exports.createPayment = async (req, res) => {
  try {
    const { saleId, invoiceNumber, amount, paymentMethod, notes } = req.body;

    if (!saleId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Sale ID, amount, and payment method are required',
      });
    }

    // Find the sale and populate all necessary data
    const sale = await Sale.findById(saleId)
      .populate('customer')
      .populate('cashier', 'name email')
      .populate('items.product');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found',
      });
    }

    // Update sale status to paid
    sale.paymentStatus = 'paid';
    sale.paymentMethod = paymentMethod; // Ensure paymentMethod is updated
    const previousAmountPaid = sale.amountPaid || 0;
    sale.amountPaid = amount;
    await sale.save();

    // Update customer statistics if customer exists
    if (sale.customer) {
      const customerDoc = await Customer.findById(sale.customer);
      if (customerDoc) {
        const additionalPaid = amount - previousAmountPaid;
        customerDoc.totalPaid = (customerDoc.totalPaid || 0) + additionalPaid;
        customerDoc.totalDue = Math.max(0, (customerDoc.totalDue || 0) - additionalPaid);
        await customerDoc.save();
      }
    }

    // Create payment record
    const payment = await Payment.create({
      sale: saleId,
      invoiceNumber: invoiceNumber || sale.invoiceNumber,
      amount,
      paymentMethod,
      status: 'completed',
      notes,
    });

    // Re-fetch payment with populated sale data
    const populatedPayment = await Payment.findById(payment._id)
      .populate({
        path: 'sale',
        populate: [
          { path: 'customer' },
          { path: 'cashier', select: 'name email' },
          { path: 'items.product' },
        ],
      });

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: { payment: populatedPayment },
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment',
      error: error.message,
    });
  }
};

// @desc    Save cart as pending bill
// @route   POST /api/payments/save-cart
// @access  Private
exports.saveCartAsPending = async (req, res) => {
  try {
    const { saleId, invoiceNumber, amount, notes } = req.body;

    if (!saleId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Sale ID and amount are required',
      });
    }

    // Update sale status to pending
    const updatedSale = await Sale.findByIdAndUpdate(
      saleId,
      {
        paymentStatus: 'pending',
        amountPaid: 0,
        notes: notes || '',
      },
      { new: true }
    );

    if (!updatedSale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Bill saved as pending',
      data: { sale: updatedSale },
    });
  } catch (error) {
    console.error('Save cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving cart',
      error: error.message,
    });
  }
};

// @desc    Get all payments with sale details
// @route   GET /api/payments
// @access  Private
exports.getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 1000, status, paymentMethod, startDate, endDate } = req.query;

    let query = {};

    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    
    // Add date filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const payments = await Payment.find(query)
      .populate({
        path: 'sale',
        populate: [
          { path: 'customer' },
          { path: 'cashier', select: 'name email' },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        payments,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      },
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message,
    });
  }
};

// @desc    Get pending bills
// @route   GET /api/payments/pending
// @access  Private
exports.getPendingBills = async (req, res) => {
  try {
    const pendingBills = await Sale.find({ paymentStatus: 'pending' })
      .populate('customer')
      .populate('cashier', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { bills: pendingBills },
    });
  } catch (error) {
    console.error('Get pending bills error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending bills',
      error: error.message,
    });
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'sale',
        populate: [
          { path: 'customer' },
          { path: 'cashier', select: 'name email' },
          { path: 'items.product' },
        ],
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { payment },
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment',
      error: error.message,
    });
  }
};
