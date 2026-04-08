const express = require('express');
const router = express.Router();
const {
  getInventory,
  getLowStock,
  updateInventory,
  getProductInventory,
  updateStock,
} = require('../controllers/inventory.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getInventory);
router.get('/low-stock', protect, getLowStock);
router.get('/product/:productId/store/:storeId', protect, getProductInventory);
router.put('/stock/:productId', protect, updateStock); // Changed to /stock/:productId to avoid conflicts
router.put('/:id', protect, updateInventory);

module.exports = router;
