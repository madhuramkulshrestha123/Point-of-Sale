const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide employee name'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    required: [true, 'Please provide employee role'],
    enum: ['admin', 'manager', 'cashier', 'worker'],
    default: 'cashier',
  },
  salary: {
    type: Number,
    required: [true, 'Please provide salary'],
    min: [0, 'Salary must be greater than 0'],
  },
  joiningDate: {
    type: Date,
    required: [true, 'Please provide joining date'],
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  address: {
    type: String,
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
employeeSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Employee', employeeSchema);
