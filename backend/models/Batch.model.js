const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
  },
  batchNumber: {
    type: String,
    required: [true, 'Please provide a batch number'],
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  expiryDate: {
    type: Date,
  },
  manufactureDate: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for FIFO queries
batchSchema.index({ product: 1, store: 1, createdAt: 1 });

module.exports = mongoose.model('Batch', batchSchema);
