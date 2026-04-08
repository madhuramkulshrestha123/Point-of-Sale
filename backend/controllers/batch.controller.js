const Batch = require('../models/Batch.model');
const Inventory = require('../models/Inventory.model');

// @desc    Get all batches
// @route   GET /api/batches
// @access  Private
exports.getBatches = async (req, res) => {
  try {
    const { product, store, status } = req.query;

    let query = {};

    if (product) query.product = product;
    if (store) query.store = store;
    if (status === 'active') query.isActive = true;

    const batches = await Batch.find(query)
      .populate('product')
      .populate('store')
      .sort({ expiryDate: 1 });

    res.status(200).json({
      success: true,
      data: { batches },
    });
  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching batches',
      error: error.message,
    });
  }
};

// @desc    Get expiring batches
// @route   GET /api/batches/expiring/:days
// @access  Private
exports.getExpiringBatches = async (req, res) => {
  try {
    const days = parseInt(req.params.days) || 7;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const batches = await Batch.find({
      expiryDate: { $lte: expiryDate, $gte: new Date() },
      isActive: true,
    })
      .populate('product')
      .populate('store')
      .sort({ expiryDate: 1 });

    res.status(200).json({
      success: true,
      data: { batches },
    });
  } catch (error) {
    console.error('Get expiring batches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expiring batches',
      error: error.message,
    });
  }
};

// @desc    Create batch
// @route   POST /api/batches
// @access  Private
exports.createBatch = async (req, res) => {
  try {
    const { product, store, quantity, purchasePrice } = req.body;

    const batch = await Batch.create(req.body);

    // Update or create inventory
    let inventory = await Inventory.findOne({ product, store });

    if (inventory) {
      inventory.totalQuantity += quantity;
      inventory.lastRestocked = Date.now();
      inventory.updatedAt = Date.now();
      await inventory.save();
    } else {
      await Inventory.create({
        product,
        store,
        totalQuantity: quantity,
        lastRestocked: Date.now(),
      });
    }

    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: { batch },
    });
  } catch (error) {
    console.error('Create batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating batch',
      error: error.message,
    });
  }
};

// @desc    Update batch
// @route   PUT /api/batches/:id
// @access  Private
exports.updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Batch updated successfully',
      data: { batch },
    });
  } catch (error) {
    console.error('Update batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating batch',
      error: error.message,
    });
  }
};
