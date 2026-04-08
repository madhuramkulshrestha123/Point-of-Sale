const PurchaseOrder = require('../models/PurchaseOrder.model');
const Batch = require('../models/Batch.model');
const Inventory = require('../models/Inventory.model');
const mongoose = require('mongoose');

// Generate order number
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PO-${year}${month}${day}-${random}`;
};

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
// @access  Private
exports.getPurchaseOrders = async (req, res) => {
  try {
    const { store, supplier, status, page = 1, limit = 50 } = req.query;

    let query = {};

    if (store) query.store = store;
    if (supplier) query.supplier = supplier;
    if (status) query.status = status;

    const purchaseOrders = await PurchaseOrder.find(query)
      .populate('supplier')
      .populate('store')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await PurchaseOrder.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        purchaseOrders,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      },
    });
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching purchase orders',
      error: error.message,
    });
  }
};

// @desc    Get single purchase order
// @route   GET /api/purchase-orders/:id
// @access  Private
exports.getPurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate('supplier')
      .populate('store')
      .populate('items.product')
      .populate('createdBy', 'name email');

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { purchaseOrder },
    });
  } catch (error) {
    console.error('Get purchase order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching purchase order',
      error: error.message,
    });
  }
};

// @desc    Create purchase order
// @route   POST /api/purchase-orders
// @access  Private
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { supplier, store, items, notes, expectedDeliveryDate } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required',
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const costPrice = item.costPrice;
      const subtotal = costPrice * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        product: item.product,
        productName: item.productName || '',
        quantity: item.quantity,
        costPrice,
        subtotal,
      });
    }

    const purchaseOrder = await PurchaseOrder.create({
      orderNumber: generateOrderNumber(),
      supplier,
      store,
      items: orderItems,
      totalAmount,
      notes,
      expectedDeliveryDate,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      data: { purchaseOrder },
    });
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating purchase order',
      error: error.message,
    });
  }
};

// @desc    Receive purchase order (add stock)
// @route   PUT /api/purchase-orders/:id/receive
// @access  Private
exports.receivePurchaseOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id).session(session);

    if (!purchaseOrder) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found',
      });
    }

    if (purchaseOrder.status === 'received') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Purchase order already received',
      });
    }

    // Create batches and update inventory
    for (const item of purchaseOrder.items) {
      // Create batch
      await Batch.create([{
        product: item.product,
        store: purchaseOrder.store,
        batchNumber: `BATCH-${purchaseOrder.orderNumber}-${item.product}`,
        quantity: item.quantity,
        purchasePrice: item.costPrice,
        manufactureDate: new Date(),
      }], { session });

      // Update inventory
      let inventory = await Inventory.findOne({
        product: item.product,
        store: purchaseOrder.store,
      }).session(session);

      if (inventory) {
        inventory.totalQuantity += item.quantity;
        inventory.lastRestocked = Date.now();
        inventory.updatedAt = Date.now();
        await inventory.save({ session });
      } else {
        await Inventory.create([{
          product: item.product,
          store: purchaseOrder.store,
          totalQuantity: item.quantity,
          lastRestocked: Date.now(),
        }], { session });
      }
    }

    purchaseOrder.status = 'received';
    purchaseOrder.receivedDate = Date.now();
    await purchaseOrder.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Purchase order received and inventory updated',
      data: { purchaseOrder },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Receive purchase order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error receiving purchase order',
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// @desc    Update purchase order
// @route   PUT /api/purchase-orders/:id
// @access  Private
exports.updatePurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Purchase order updated successfully',
      data: { purchaseOrder },
    });
  } catch (error) {
    console.error('Update purchase order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating purchase order',
      error: error.message,
    });
  }
};
