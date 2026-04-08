const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  createPayment,
  saveCartAsPending,
  getPayments,
  getPendingBills,
  getPayment,
} = require('../controllers/payment.controller');

router.post('/', protect, createPayment);
router.post('/save-cart', protect, saveCartAsPending);
router.get('/', protect, getPayments);
router.get('/pending', protect, getPendingBills);
router.get('/:id', protect, getPayment);

module.exports = router;
