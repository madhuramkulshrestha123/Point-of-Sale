const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
});

// @desc    Upload category image to Cloudinary
// @route   POST /api/upload/category-image
// @access  Private
exports.uploadCategoryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file',
      });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'pos_categories',
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });

    res.status(200).json({
      success: true,
      data: {
        imageUrl: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message,
    });
  }
};

// Export multer middleware for use in routes
exports.upload = upload;
