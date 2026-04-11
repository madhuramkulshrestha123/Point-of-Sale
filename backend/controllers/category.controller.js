const Category = require('../models/Category.model');
const Product = require('../models/Product.model');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message,
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message,
    });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin/Manager)
exports.createCategory = async (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name || !image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and image',
      });
    }

    const category = await Category.create({ name, image });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category },
    });
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message,
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin/Manager)
exports.updateCategory = async (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name || !image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and image',
      });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, image },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: { category },
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message,
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if category is used in products
    const productCount = await Product.countDocuments({ category: category.name });
    
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It is used in ${productCount} product(s).`,
      });
    }

    // Hard delete since no products are using it
    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message,
    });
  }
};
