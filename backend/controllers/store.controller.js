const Store = require('../models/Store.model');

// @desc    Get all stores
// @route   GET /api/stores
// @access  Private
exports.getStores = async (req, res) => {
  try {
    const stores = await Store.find({ isActive: true }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { stores },
    });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stores',
      error: error.message,
    });
  }
};

// @desc    Get single store
// @route   GET /api/stores/:id
// @access  Private
exports.getStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { store },
    });
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching store',
      error: error.message,
    });
  }
};

// @desc    Create store
// @route   POST /api/stores
// @access  Private (Admin)
exports.createStore = async (req, res) => {
  try {
    const store = await Store.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: { store },
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating store',
      error: error.message,
    });
  }
};

// @desc    Update store
// @route   PUT /api/stores/:id
// @access  Private (Admin)
exports.updateStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Store updated successfully',
      data: { store },
    });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating store',
      error: error.message,
    });
  }
};

// @desc    Delete store
// @route   DELETE /api/stores/:id
// @access  Private (Admin)
exports.deleteStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found',
      });
    }

    store.isActive = false;
    await store.save();

    res.status(200).json({
      success: true,
      message: 'Store deactivated successfully',
    });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting store',
      error: error.message,
    });
  }
};
