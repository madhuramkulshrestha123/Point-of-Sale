const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {
  createSale,
  getSales,
  getSale,
  getSalesAnalytics,
} = require('../controllers/sale.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, createSale);
router.get('/', protect, getSales);
router.get('/analytics', protect, getSalesAnalytics);
router.get('/:id', protect, getSale);

module.exports = router;
