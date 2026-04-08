const Product = require('../models/Product.model');
const Inventory = require('../models/Inventory.model');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res) => {
  try {
    const { category, brand, search, page = 1, limit = 50 } = req.query;

    let query = {};

    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query)
      .populate('supplier')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        products,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message,
    });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private (Admin/Manager)
exports.createProduct = async (req, res) => {
  try {
    // Handle empty supplier field
    if (req.body.supplier === '' || req.body.supplier === undefined) {
      delete req.body.supplier;
    }

    const product = await Product.create(req.body);

    // Populate supplier if exists
    const populatedProduct = await Product.findById(product._id).populate('supplier');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product: populatedProduct },
    });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists',
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        error: Object.values(error.errors).map(err => err.message).join(', '),
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message,
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin/Manager)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product },
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message,
    });
  }
};

// @desc    Update product stock (restock/dispose)
// @route   PUT /api/products/:id/stock
// @access  Private
exports.updateProductStock = async (req, res) => {
  try {
    const { action, quantity, reason } = req.body;
    const { id } = req.params;

    // Validate inputs
    if (!action || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid action and quantity',
      });
    }

    // Find product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    let newStockQuantity = product.stockQuantity;

    // Perform action
    if (action === 'restock') {
      newStockQuantity += quantity;
      console.log(`Restocking: Current ${product.stockQuantity} + ${quantity} = ${newStockQuantity}`);
    } else if (action === 'dispose') {
      if (quantity > product.stockQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Cannot dispose more than available stock',
        });
      }
      newStockQuantity -= quantity;
      console.log(`Disposing: Current ${product.stockQuantity} - ${quantity} = ${newStockQuantity}`);
    } else if (action === 'update') {
      // Direct stock update
      newStockQuantity = quantity;
      console.log(`Updating stock to: ${quantity}`);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use restock, dispose, or update',
      });
    }

    // Update product stock
    product.stockQuantity = newStockQuantity;
    await product.save();
    
    console.log(`Stock updated successfully for product ${product.name}. New quantity: ${newStockQuantity}`);

    // Also update inventory records if they exist
    try {
      const inventoryRecords = await Inventory.find({ product: id });
      if (inventoryRecords.length > 0) {
        // Update all inventory records for this product
        for (const inv of inventoryRecords) {
          inv.totalQuantity = newStockQuantity;
          inv.lastRestocked = action === 'restock' ? Date.now() : inv.lastRestocked;
          inv.updatedAt = Date.now();
          await inv.save();
        }
        console.log(`Updated ${inventoryRecords.length} inventory record(s)`);
      }
    } catch (invError) {
      console.error('Error updating inventory records:', invError.message);
      // Don't fail the request if inventory update fails
    }

    res.status(200).json({
      success: true,
      message: `Stock ${action === 'update' ? 'updated' : action + 'ed'} successfully`,
      data: { product },
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating stock',
      error: error.message,
    });
  }
};
