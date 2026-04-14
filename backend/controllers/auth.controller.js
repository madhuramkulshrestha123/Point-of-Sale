const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Sale = require('../models/Sale.model');
const Payment = require('../models/Payment.model');
const OTP = require('../models/OTP.model');
const { generateOTP, sendOTPEmail, sendRegistrationSuccessEmail } = require('../utils/email');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Send OTP for registration
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendRegistrationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Business already exists with this email',
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email });

    // Save new OTP
    await OTP.create({ email, otp });

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.',
        error: emailResult.error,
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email successfully. Valid for 10 minutes.',
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
      error: error.message,
    });
  }
};

// @desc    Verify OTP and complete registration
// @route   POST /api/auth/verify-otp-and-register
// @access  Public
exports.verifyOTPAndRegister = async (req, res) => {
  try {
    const { email, otp, businessName, ownerName, phone, pin, gstNumber, upiId, currency, address } = req.body;

    // Validate OTP
    if (!otp || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Must be 6 digits.',
      });
    }

    // Find OTP in database
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.',
      });
    }

    // Validate PIN is 4 digits
    if (!pin || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: 'PIN must be exactly 4 digits',
      });
    }

    // Validate GST format if provided
    if (gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/.test(gstNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GST format. Example: 27AABCU9603R1ZM',
      });
    }

    // Check if user already exists (double-check)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Business already exists with this email',
      });
    }

    // Create user with business details
    const user = await User.create({
      businessName,
      ownerName,
      email,
      phone,
      pin,
      gstNumber,
      upiId: upiId || undefined,
      currency: currency || 'INR',
      address,
      role: 'admin',
    });

    // Delete the used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate token
    const token = generateToken(user._id);

    // Send registration success email
    sendRegistrationSuccessEmail(email, businessName).catch(err => {
      console.error('Failed to send registration success email:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Business registered successfully',
      data: {
        user: {
          id: user._id,
          businessName: user.businessName,
          businessId: user.businessId,
          ownerName: user.ownerName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          address: user.address,
          gstNumber: user.gstNumber,
          upiId: user.upiId,
          currency: user.currency,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Verify OTP and register error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Business already exists with this email or ID',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error registering business',
      error: error.message,
    });
  }
};

// @desc    Login user with Business ID and PIN
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { businessId, pin } = req.body;

    // Validate input
    if (!businessId || !pin) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Business ID and PIN',
      });
    }

    // Check for user by businessId OR email (case-insensitive)
    const user = await User.findOne({ 
      $or: [
        { businessId: { $regex: new RegExp(businessId, 'i') } },
        { email: { $regex: new RegExp(businessId, 'i') } }
      ]
    }).select('+pin +password').populate('store');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Business ID or PIN',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // Check PIN
    const isMatch = await user.comparePin(pin);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Business ID or PIN',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          businessName: user.businessName,
          businessId: user.businessId,
          ownerName: user.ownerName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          address: user.address,
          logo: user.logo,
          store: user.store,
          gstNumber: user.gstNumber,
          currency: user.currency,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('store');

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          businessName: user.businessName,
          businessId: user.businessId,
          ownerName: user.ownerName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          address: user.address,
          logo: user.logo,
          store: user.store,
          gstNumber: user.gstNumber,
          upiId: user.upiId,
          currency: user.currency,
        },
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { businessName, ownerName, email, phone, gstNumber, upiId, currency, address, logo } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Validate GST format if provided
    if (gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/.test(gstNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GST format. Example: 27AABCU9603R1ZM',
      });
    }

    // Update fields
    if (businessName) user.businessName = businessName;
    if (ownerName) user.ownerName = ownerName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (gstNumber !== undefined) user.gstNumber = gstNumber;
    if (upiId !== undefined) user.upiId = upiId || undefined;
    if (currency) user.currency = currency;
    if (address) user.address = address;
    if (logo !== undefined) user.logo = logo;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          businessName: user.businessName,
          businessId: user.businessId,
          ownerName: user.ownerName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          address: user.address,
          logo: user.logo,
          gstNumber: user.gstNumber,
          upiId: user.upiId,
          currency: user.currency,
        },
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

// @desc    Verify PIN for sensitive operations
// @route   POST /api/auth/verify-pin
// @access  Private
exports.verifyPin = async (req, res) => {
  try {
    const { pin } = req.body;

    // Validate PIN is 4 digits
    if (!pin || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: 'PIN must be exactly 4 digits',
      });
    }

    const user = await User.findById(req.user._id).select('+pin');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify PIN
    const isMatch = await user.comparePin(pin);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect PIN',
      });
    }

    res.status(200).json({
      success: true,
      message: 'PIN verified successfully',
    });
  } catch (error) {
    console.error('Verify PIN error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying PIN',
      error: error.message,
    });
  }
};

// @desc    Change PIN
// @route   PUT /api/auth/change-pin
// @access  Private
exports.changePin = async (req, res) => {
  try {
    const { currentPin, newPin } = req.body;

    // Validate new PIN
    if (!newPin || !/^\d{4}$/.test(newPin)) {
      return res.status(400).json({
        success: false,
        message: 'New PIN must be exactly 4 digits',
      });
    }

    const user = await User.findById(req.user._id).select('+pin');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current PIN
    const isMatch = await user.comparePin(currentPin);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current PIN is incorrect',
      });
    }

    // Update PIN
    user.pin = newPin;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'PIN changed successfully',
    });
  } catch (error) {
    console.error('Change PIN error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing PIN',
      error: error.message,
    });
  }
};

// @desc    Reset all bills and payments (Admin only)
// @route   DELETE /api/sales/reset-all-bills-payments
// @access  Private (Admin only)
exports.resetAllBillsAndPayments = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can reset bills and payments',
      });
    }

    // Delete all payments first (since they reference sales)
    const paymentsResult = await Payment.deleteMany({});
    console.log(`Deleted ${paymentsResult.deletedCount} payment records`);

    // Delete all sales
    const salesResult = await Sale.deleteMany({});
    console.log(`Deleted ${salesResult.deletedCount} sale records`);

    res.status(200).json({
      success: true,
      message: `Successfully reset all data. Deleted ${salesResult.deletedCount} bills and ${paymentsResult.deletedCount} payment records.`,
      data: {
        salesDeleted: salesResult.deletedCount,
        paymentsDeleted: paymentsResult.deletedCount,
      },
    });
  } catch (error) {
    console.error('Reset all bills and payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting bills and payments',
      error: error.message,
    });
  }
};
