const Customer = require('../models/Customer.model');
const Sale = require('../models/Sale.model');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
exports.getCustomers = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Customer.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        customers,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      },
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message,
    });
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { customer },
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer',
      error: error.message,
    });
  }
};

// @desc    Create customer
// @route   POST /api/customers
// @access  Private
exports.createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: { customer },
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating customer',
      error: error.message,
    });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: { customer },
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: error.message,
    });
  }
};

// @desc    Get customer statistics
// @route   GET /api/customers/stats
// @access  Private
exports.getCustomerStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    
    // Handle status field that might not exist in old documents
    const activeCustomers = await Customer.countDocuments({ 
      $or: [ 
        { status: 'active' }, 
        { status: { $exists: false } } 
      ] 
    });

    // Get total revenue from sales
    const revenueAgg = await Sale.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' },
        },
      },
    ]);

    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Get total pending amount (dues) from sales with pending status
    const pendingAgg = await Sale.aggregate([
      {
        $match: {
          paymentStatus: { $in: ['pending', 'partial'] },
        },
      },
      {
        $group: {
          _id: null,
          totalPending: { $sum: { $subtract: ['$finalAmount', '$amountPaid'] } },
        },
      },
    ]);

    const totalPending = pendingAgg.length > 0 ? pendingAgg[0].totalPending : 0;

    // Get total loyalty points
    const pointsAgg = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalPoints: { $sum: { $ifNull: ['$loyaltyPoints', 0] } },
        },
      },
    ]);

    const totalLoyaltyPoints = pointsAgg.length > 0 ? pointsAgg[0].totalPoints : 0;

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        totalRevenue,
        totalPending,
        totalLoyaltyPoints,
      },
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer statistics',
      error: error.message,
    });
  }
};

// @desc    Get customer orders
// @route   GET /api/customers/:id/orders
// @access  Private
exports.getCustomerOrders = async (req, res) => {
  try {
    const orders = await Sale.find({ customer: req.params.id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name');

    res.status(200).json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer orders',
      error: error.message,
    });
  }
};

// @desc    Toggle customer status
// @route   PUT /api/customers/:id/toggle-status
// @access  Private
exports.toggleCustomerStatus = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    customer.status = customer.status === 'active' ? 'inactive' : 'active';
    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Customer status updated successfully',
      data: { customer },
    });
  } catch (error) {
    console.error('Toggle customer status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer status',
      error: error.message,
    });
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    await Customer.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: error.message,
    });
  }
};
