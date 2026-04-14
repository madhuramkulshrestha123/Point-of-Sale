const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePin, verifyPin, resetAllBillsAndPayments } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-pin', protect, changePin);
router.post('/verify-pin', protect, verifyPin);
router.delete('/reset-all-bills-payments', protect, resetAllBillsAndPayments);

module.exports = router;
