const express = require('express');
const router = express.Router();
const {
  getBatches,
  getExpiringBatches,
  createBatch,
  updateBatch,
} = require('../controllers/batch.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getBatches);
router.get('/expiring/:days', protect, getExpiringBatches);
router.post('/', protect, createBatch);
router.put('/:id', protect, updateBatch);

module.exports = router;
