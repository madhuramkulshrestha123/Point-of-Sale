const Supplier = require('../models/Supplier.model');
const Product = require('../models/Product.model');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
exports.getSuppliers = async (req, res) => {
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

    const suppliers = await Supplier.find(query)
      .populate('products')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Supplier.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        suppliers,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      },
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching suppliers',
      error: error.message,
    });
  }
};

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Private
exports.getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id).populate('products');

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { supplier },
    });
  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching supplier',
      error: error.message,
    });
  }
};

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private
exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: { supplier },
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating supplier',
      error: error.message,
    });
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private
exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      data: { supplier },
    });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating supplier',
      error: error.message,
    });
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
    }

    // Check if supplier is linked to any products
    const linkedProducts = await Product.find({ supplier: req.params.id });
    
    if (linkedProducts.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete supplier. This supplier is linked to ${linkedProducts.length} product(s). Please unlink or reassign products first.`,
      });
    }

    await Supplier.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully',
    });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting supplier',
      error: error.message,
    });
  }
};
