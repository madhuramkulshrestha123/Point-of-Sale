const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Business Information
  businessName: {
    type: String,
    required: [true, 'Please provide a business name'],
    trim: true,
  },
  businessId: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true,
  },
  ownerName: {
    type: String,
    required: [true, 'Please provide owner name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true,
  },
  // PIN (4 digits)
  pin: {
    type: String,
    required: [true, 'Please set a 4-digit PIN'],
    minlength: 4,
    maxlength: 4,
    select: false,
  },
  // Legacy password field (kept for backward compatibility)
  password: {
    type: String,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'cashier'],
    default: 'admin',
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  gstNumber: {
    type: String,
    uppercase: true,
    trim: true,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/, 'Please provide a valid GST number'],
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP', 'AED'],
  },
  logo: {
    type: String,
    default: '',
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

// Generate unique business ID and hash PIN before saving
userSchema.pre('save', async function() {
  const user = this;

  // Generate business ID if not exists
  if (!user.businessId) {
    const timestamp = Date.now().toString().slice(-6);
    user.businessId = `BIZ${timestamp}`;
  }

  // Hash PIN if modified
  if (!user.isModified('pin')) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    user.pin = await bcrypt.hash(user.pin, salt);
  } catch (err) {
    throw err;
  }
});

// Compare PIN method
userSchema.methods.comparePin = async function(candidatePin) {
  return await bcrypt.compare(candidatePin, this.pin);
};

// Legacy password comparison
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
