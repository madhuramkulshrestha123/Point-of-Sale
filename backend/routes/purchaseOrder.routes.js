const express = require('express');
const router = express.Router();
const {
  getPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  receivePurchaseOrder,
  updatePurchaseOrder,
} = require('../controllers/purchaseOrder.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getPurchaseOrders);
router.get('/:id', protect, getPurchaseOrder);
router.post('/', protect, createPurchaseOrder);
router.put('/:id/receive', protect, receivePurchaseOrder);
router.put('/:id', protect, updatePurchaseOrder);

module.exports = router;
