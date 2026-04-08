const Inventory = require('../models/Inventory.model');
const Batch = require('../models/Batch.model');
const Product = require('../models/Product.model');

// @desc    Get all inventory for a store
// @route   GET /api/inventory
// @access  Private
exports.getInventory = async (req, res) => {
  try {
    const { store } = req.query;

    let query = {};
    if (store) query.store = store;

    const inventory = await Inventory.find(query)
      .populate('product')
      .populate('store')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: { inventory },
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory',
      error: error.message,
    });
  }
};

// @desc    Get low stock items
// @route   GET /api/inventory/low-stock
// @access  Private
exports.getLowStock = async (req, res) => {
  try {
    const inventory = await Inventory.find({
      $expr: { $lt: ['$totalQuantity', '$lowStockThreshold'] },
    })
      .populate('product')
      .populate('store');

    res.status(200).json({
      success: true,
      data: { inventory },
    });
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock items',
      error: error.message,
    });
  }
};

// @desc    Update inventory quantity
// @route   PUT /api/inventory/:id
// @access  Private
exports.updateInventory = async (req, res) => {
  try {
    const { totalQuantity, lowStockThreshold } = req.body;

    let inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found',
      });
    }

    if (totalQuantity !== undefined) {
      inventory.totalQuantity = totalQuantity;
    }
    if (lowStockThreshold !== undefined) {
      inventory.lowStockThreshold = lowStockThreshold;
    }

    inventory.updatedAt = Date.now();
    await inventory.save();

    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: { inventory },
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating inventory',
      error: error.message,
    });
  }
};

// @desc    Get inventory by product and store
// @route   GET /api/inventory/product/:productId/store/:storeId
// @access  Private
exports.getProductInventory = async (req, res) => {
  try {
    const { productId, storeId } = req.params;

    const inventory = await Inventory.findOne({
      product: productId,
      store: storeId,
    }).populate('product').populate('store');

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found for this product in this store',
      });
    }

    res.status(200).json({
      success: true,
      data: { inventory },
    });
  } catch (error) {
    console.error('Get product inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product inventory',
      error: error.message,
    });
  }
};

// @desc    Update product stock (restock/dispose)
// @route   PUT /api/inventory/:productId/stock
// @access  Private
exports.updateStock = async (req, res) => {
  try {
    const { action, quantity, reason } = req.body;
    const { productId } = req.params;

    // Validate inputs
    if (!action || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid action and quantity',
      });
    }

    // Find product
    const product = await Product.findById(productId);
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
      const inventoryRecords = await Inventory.find({ product: productId });
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
