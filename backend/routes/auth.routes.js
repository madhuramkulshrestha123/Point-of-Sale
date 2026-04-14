const express = require('express');
const router = express.Router();
const { 
  login, 
  getMe, 
  updateProfile, 
  changePin, 
  verifyPin, 
  resetAllBillsAndPayments,
  sendRegistrationOTP,
  verifyOTPAndRegister
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Registration with OTP
router.post('/send-otp', sendRegistrationOTP);
router.post('/verify-otp-and-register', verifyOTPAndRegister);

router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-pin', protect, changePin);
router.post('/verify-pin', protect, verifyPin);
router.delete('/reset-all-bills-payments', protect, resetAllBillsAndPayments);

module.exports = router;
