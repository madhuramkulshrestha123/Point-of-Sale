const express = require('express');
const router = express.Router();
const { getStores, getStore, createStore, updateStore, deleteStore } = require('../controllers/store.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, getStores);
router.get('/:id', protect, getStore);
router.post('/', protect, authorize('admin'), createStore);
router.put('/:id', protect, authorize('admin'), updateStore);
router.delete('/:id', protect, authorize('admin'), deleteStore);

module.exports = router;
