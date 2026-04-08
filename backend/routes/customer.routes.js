const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomer,
  getCustomerStats,
  getCustomerOrders,
  createCustomer,
  updateCustomer,
  toggleCustomerStatus,
  deleteCustomer,
} = require('../controllers/customer.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getCustomers);
router.get('/stats', protect, getCustomerStats);
router.post('/', protect, createCustomer);

// Specific routes with parameters
router.put('/:id/toggle-status', protect, toggleCustomerStatus);
router.get('/:id/orders', protect, getCustomerOrders);

// Generic ID route (must come last)
router.get('/:id', protect, getCustomer);
router.put('/:id', protect, updateCustomer);
router.delete('/:id', protect, deleteCustomer);

module.exports = router;
