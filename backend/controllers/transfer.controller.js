const StockTransfer = require('../models/StockTransfer.model');
const Inventory = require('../models/Inventory.model');
const mongoose = require('mongoose');

// Generate transfer number
const generateTransferNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TRF-${year}${month}${day}-${random}`;
};

// @desc    Get all stock transfers
// @route   GET /api/transfers
// @access  Private
exports.getTransfers = async (req, res) => {
  try {
    const { fromStore, toStore, status, page = 1, limit = 50 } = req.query;

    let query = {};

    if (fromStore) query.fromStore = fromStore;
    if (toStore) query.toStore = toStore;
    if (status) query.status = status;

    const transfers = await StockTransfer.find(query)
      .populate('fromStore')
      .populate('toStore')
      .populate('transferredBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await StockTransfer.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        transfers,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      },
    });
  } catch (error) {
    console.error('Get transfers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stock transfers',
      error: error.message,
    });
  }
};

// @desc    Get single stock transfer
// @route   GET /api/transfers/:id
// @access  Private
exports.getTransfer = async (req, res) => {
  try {
    const transfer = await StockTransfer.findById(req.params.id)
      .populate('fromStore')
      .populate('toStore')
      .populate('items.product')
      .populate('transferredBy', 'name email');

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Stock transfer not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { transfer },
    });
  } catch (error) {
    console.error('Get transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stock transfer',
      error: error.message,
    });
  }
};

// @desc    Create stock transfer
// @route   POST /api/transfers
// @access  Private
exports.createTransfer = async (req, res) => {
  try {
    const { fromStore, toStore, items, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required',
      });
    }

    // Check inventory availability
    for (const item of items) {
      const inventory = await Inventory.findOne({
        product: item.product,
        store: fromStore,
      });

      if (!inventory || inventory.totalQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${item.product}`,
        });
      }
    }

    const transfer = await StockTransfer.create({
      transferNumber: generateTransferNumber(),
      fromStore,
      toStore,
      items,
      transferredBy: req.user._id,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Stock transfer created successfully',
      data: { transfer },
    });
  } catch (error) {
    console.error('Create transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating stock transfer',
      error: error.message,
    });
  }
};

// @desc    Complete stock transfer
// @route   PUT /api/transfers/:id/complete
// @access  Private
exports.completeTransfer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transfer = await StockTransfer.findById(req.params.id).session(session);

    if (!transfer) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Stock transfer not found',
      });
    }

    if (transfer.status === 'completed') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Transfer already completed',
      });
    }

    // Update inventory
    for (const item of transfer.items) {
      // Decrease from source store
      const fromInventory = await Inventory.findOne({
        product: item.product,
        store: transfer.fromStore,
      }).session(session);

      if (fromInventory) {
        fromInventory.totalQuantity -= item.quantity;
        fromInventory.updatedAt = Date.now();
        await fromInventory.save({ session });
      }

      // Increase in destination store
      let toInventory = await Inventory.findOne({
        product: item.product,
        store: transfer.toStore,
      }).session(session);

      if (toInventory) {
        toInventory.totalQuantity += item.quantity;
        toInventory.updatedAt = Date.now();
        await toInventory.save({ session });
      } else {
        await Inventory.create([{
          product: item.product,
          store: transfer.toStore,
          totalQuantity: item.quantity,
        }], { session });
      }
    }

    transfer.status = 'completed';
    transfer.completedAt = Date.now();
    transfer.approvedBy = req.user._id;
    await transfer.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Stock transfer completed successfully',
      data: { transfer },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Complete transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing stock transfer',
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};
