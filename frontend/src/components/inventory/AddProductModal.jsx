import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Category image/icon mapping for display
const CATEGORY_ICONS = {
  'Engine Oil': { icon: '🛢️', color: 'from-blue-400 to-blue-600' },
  'Filters': { icon: '🔧', color: 'from-green-400 to-green-600' },
  'Brakes': { icon: '🔴', color: 'from-red-400 to-red-600' },
  'Battery': { icon: '🔋', color: 'from-yellow-400 to-yellow-600' },
  'Tires': { icon: '⚫', color: 'from-gray-600 to-gray-800' },
  'Accessories': { icon: '🔩', color: 'from-purple-400 to-purple-600' },
};

// Helper function to get category icon data
const getCategoryIconData = (imageValue) => {
  if (!imageValue) return { icon: '📦', color: 'from-gray-400 to-gray-600' };
  
  // If it's a URL, return null to indicate image should be used
  if (imageValue.startsWith('http')) {
    return { isUrl: true, url: imageValue };
  }
  
  // Otherwise return the predefined icon
  return CATEGORY_ICONS[imageValue] || { icon: '📦', color: 'from-gray-400 to-gray-600' };
};

const AddProductModal = ({ isOpen, onClose, onSuccess, suppliers: suppliersProp }) => {
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategoryImage, setSelectedCategoryImage] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    brand: '',
    description: '',
    costPrice: '',
    sellingPrice: '',
    mrp: '',
    discount: '',
    gstRate: '18',
    stockQuantity: '',
    reorderLevel: '10',
    supplier: '',
    vehicleCompatibility: '',
    barcode: '',
    image: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      
      // Use suppliers from props if available, otherwise fetch
      if (suppliersProp && suppliersProp.length > 0) {
        console.log('Suppliers from props:', suppliersProp);
        setSuppliers(suppliersProp);
      } else {
        fetchSuppliers();
      }
    }
  }, [isOpen, suppliersProp]);

  // Log suppliers when they change
  useEffect(() => {
    console.log('Current suppliers state:', suppliers);
  }, [suppliers]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setCategories(response.data.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/suppliers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        console.log('Fetched suppliers:', response.data.data.suppliers);
        setSuppliers(response.data.data.suppliers);
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      // Set empty array if API fails - supplier is optional
      setSuppliers([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Update category image when category changes
    if (name === 'category') {
      const category = categories.find(c => c.name === value);
      if (category) {
        setSelectedCategoryImage(category.image);
      } else {
        setSelectedCategoryImage(null);
      }
    }

    // Handle supplier selection
    if (name === 'supplier') {
      const supplier = suppliers.find(s => s._id === value);
      if (supplier) {
        setFormData(prev => ({
          ...prev,
          supplier: supplier._id,
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          supplier: '',
        }));
      }
    }

    // Auto-calculate discount when MRP or Selling Price changes
    if (name === 'mrp' || name === 'sellingPrice') {
      const mrp = parseFloat(name === 'mrp' ? value : formData.mrp);
      const sellingPrice = parseFloat(name === 'sellingPrice' ? value : formData.sellingPrice);
      
      if (mrp && sellingPrice && mrp > sellingPrice) {
        const discountPercent = ((mrp - sellingPrice) / mrp * 100).toFixed(2);
        setFormData(prev => ({ ...prev, discount: discountPercent }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const productData = {
        ...formData,
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        mrp: parseFloat(formData.mrp),
        discount: parseFloat(formData.discount) || 0,
        gstRate: parseFloat(formData.gstRate),
        stockQuantity: parseInt(formData.stockQuantity),
        reorderLevel: parseInt(formData.reorderLevel),
        vehicleCompatibility: formData.vehicleCompatibility.split(',').map(v => v.trim()).filter(v => v),
        categoryImage: selectedCategoryImage,
      };

      // Remove supplier field if empty to avoid validation error
      if (!productData.supplier) {
        delete productData.supplier;
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/products`, productData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        onSuccess(response.data.data.product);
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product');
      console.error('Add product error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: '',
      brand: '',
      description: '',
      costPrice: '',
      sellingPrice: '',
      mrp: '',
      discount: '',
      gstRate: '18',
      stockQuantity: '',
      reorderLevel: '10',
      supplier: '',
      vehicleCompatibility: '',
      barcode: '',
      image: '',
    });
    setSelectedCategoryImage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:max-w-6xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-4 md:px-8 md:py-6 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold md:text-2xl">Add New Product</h2>
            <p className="text-xs opacity-90 mt-1 md:text-sm md:mt-0.5">Fill in the product details below</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-4 md:space-y-6">
          {error && (
            <div className="p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Category Selection */}
          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">
              Select Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm md:text-base font-medium"
              style={{ minHeight: '48px' }}
            >
              <option value="">-- Select a Category --</option>
              {categories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            
            {/* Show selected category image/icon */}
            {selectedCategoryImage && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  {(() => {
                    const iconData = getCategoryIconData(selectedCategoryImage);
                    return iconData.isUrl ? (
                      <img
                        src={iconData.url}
                        alt="Category"
                        className="w-14 h-14 rounded-lg object-cover shadow-md"
                      />
                    ) : (
                      <div
                        className={`w-14 h-14 rounded-lg bg-gradient-to-br ${iconData.color} flex items-center justify-center text-2xl shadow-md`}
                      >
                        {iconData.icon}
                      </div>
                    );
                  })()}
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Selected Category</p>
                    <p className="text-xs text-gray-600">{categories.find(c => c._id === formData.category)?.name}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="border-t pt-4 md:pt-6">
            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 md:px-4 py-2.5 md:py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="e.g., Synthetic Engine Oil 5W-30"
                  style={{ minHeight: '44px' }}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 md:px-4 py-2.5 md:py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="e.g., Castrol"
                  style={{ minHeight: '44px' }}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  SKU *
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 md:px-4 py-2.5 md:py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm uppercase"
                  placeholder="e.g., ENG-OIL-5W30-001"
                  style={{ minHeight: '44px' }}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Barcode
                </label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  className="w-full px-3 md:px-4 py-2.5 md:py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="Scan or enter barcode"
                  style={{ minHeight: '44px' }}
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 md:px-4 py-2.5 md:py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="Product description..."
                />
              </div>
            </div>
          </div>

          {/* Pricing Details */}
          <div className="border-t pt-4 md:pt-6">
            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4">Pricing & Tax Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Cost Price (₹) *
                </label>
                <input
                  type="number"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 md:px-4 py-2.5 md:py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="0.00"
                  style={{ minHeight: '44px' }}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 md:px-4 py-2.5 md:py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="0.00"
                  style={{ minHeight: '44px' }}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  MRP (₹) *
                </label>
                <input
                  type="number"
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 md:px-4 py-2.5 md:py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="0.00"
                  style={{ minHeight: '44px' }}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  readOnly
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-3 md:px-4 py-2.5 md:py-2.5 border-2 border-gray-300 bg-gray-50 rounded-lg cursor-not-allowed text-sm"
                  placeholder="Auto-calculated"
                  style={{ minHeight: '44px' }}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  GST Rate (%)
                </label>
                <select
                  name="gstRate"
                  value={formData.gstRate}
                  onChange={handleInputChange}
                  className="w-full px-3 md:px-4 py-2.5 md:py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  style={{ minHeight: '44px' }}
                >
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stock & Supplier */}
          <div className="border-t pt-4 md:pt-6">
            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4">Stock & Supplier Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-3 md:px-4 py-2.5 md:py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="0"
                  style={{ minHeight: '44px' }}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Reorder Level
                </label>
                <input
                  type="number"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 md:px-4 py-2.5 md:py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="10"
                  style={{ minHeight: '44px' }}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Supplier (Optional)
                </label>
                <select
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className="w-full px-3 md:px-4 py-2.5 md:py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  style={{ minHeight: '44px' }}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.length > 0 ? (
                    suppliers.map(supplier => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No suppliers available</option>
                  )}
                </select>
              </div>
              <div className="col-span-2 md:col-span-3">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Vehicle Compatibility (comma-separated)
                </label>
                <input
                  type="text"
                  name="vehicleCompatibility"
                  value={formData.vehicleCompatibility}
                  onChange={handleInputChange}
                  className="w-full px-3 md:px-4 py-2.5 md:py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="e.g., Maruti Swift, Hyundai i20, Honda City"
                  style={{ minHeight: '44px' }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 md:gap-3 pt-4 md:pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 md:flex-none px-4 md:px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm md:text-base"
              style={{ minHeight: '44px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 md:flex-none px-4 md:px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              style={{ minHeight: '44px' }}
            >
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
