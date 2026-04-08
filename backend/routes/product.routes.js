const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
} = require('../controllers/product.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getProducts);
router.get('/:id', protect, getProduct);
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.put('/:id/stock', protect, updateProductStock); // Stock update route

module.exports = router;
