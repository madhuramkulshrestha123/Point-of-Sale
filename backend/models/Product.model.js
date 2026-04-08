const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
  },
  sku: {
    type: String,
    required: [true, 'Please provide a SKU'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  costPrice: {
    type: Number,
    required: [true, 'Please provide a cost price'],
    min: 0,
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Please provide a selling price'],
    min: 0,
  },
  mrp: {
    type: Number,
    required: [true, 'Please provide MRP'],
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  gstRate: {
    type: Number,
    default: 18,
    enum: [0, 5, 12, 18, 28],
  },
  stockQuantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  reorderLevel: {
    type: Number,
    default: 10,
    min: 0,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
  },
  vehicleCompatibility: {
    type: [String],
    default: [],
  },
  barcode: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    default: '',
  },
  expiryDate: {
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

module.exports = mongoose.model('Product', productSchema);
