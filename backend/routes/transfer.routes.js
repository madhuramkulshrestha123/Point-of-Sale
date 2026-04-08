const express = require('express');
const router = express.Router();
const {
  getTransfers,
  getTransfer,
  createTransfer,
  completeTransfer,
} = require('../controllers/transfer.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getTransfers);
router.get('/:id', protect, getTransfer);
router.post('/', protect, createTransfer);
router.put('/:id/complete', protect, completeTransfer);

module.exports = router;
