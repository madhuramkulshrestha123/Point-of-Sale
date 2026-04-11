const express = require('express');
const router = express.Router();
const { uploadCategoryImage, upload } = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/category-image', protect, upload.single('image'), uploadCategoryImage);

module.exports = router;
