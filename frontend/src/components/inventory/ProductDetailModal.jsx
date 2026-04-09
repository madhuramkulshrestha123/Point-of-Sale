import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const ProductDetailModal = ({ isOpen, onClose, product, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [showStockModal, setShowStockModal] = useState(false);
  const [showDisposeModal, setShowDisposeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Stock management states
  const [stockAction, setStockAction] = useState('restock');
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockReason, setStockReason] = useState('');
  
  // Edit states
  const [editData, setEditData] = useState(null);
  
  // Dispose reasons
  const disposeReasons = [
    'Damaged',
    'Expired',
    'Defective',
    'Customer Return',
    'Quality Issue',
    'Wrong Item',
    'Other'
  ];

  // Initialize edit data when product changes - MUST be before early return
  React.useEffect(() => {
    if (product) {
      setEditData({
        name: product.name || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        brand: product.brand || '',
        category: product.category || '',
        description: product.description || '',
        costPrice: product.costPrice || 0,
        sellingPrice: product.sellingPrice || 0,
        mrp: product.mrp || 0,
        discount: product.discount || 0,
        gstRate: product.gstRate || 18,
        stockQuantity: product.stockQuantity || 0,
        vehicleCompatibility: product.vehicleCompatibility || [],
      });
    }
  }, [product]);

  // Early return AFTER all hooks
  if (!isOpen || !product) return null;

  const handleClose = () => {
    onClose();
    setActiveTab('details');
    setError('');
    setSuccess('');
    setShowEditModal(false);
    setEditData(null);
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!stockQuantity || parseInt(stockQuantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const url = `${API_URL}/products/${product._id}/stock`;
      console.log('Restock URL:', url);
      console.log('Product ID:', product._id);
      console.log('Request body:', {
        action: 'restock',
        quantity: parseInt(stockQuantity),
        reason: stockReason || 'Stock replenished',
      });
      
      const response = await axios.put(
        url,
        {
          action: 'restock',
          quantity: parseInt(stockQuantity),
          reason: stockReason || 'Stock replenished',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const newQty = response.data.data.product.stockQuantity;
        setSuccess(`Stock restocked successfully! New quantity: ${newQty} Nos`);
        onUpdate(response.data.data.product);
        setTimeout(() => {
          setShowStockModal(false);
          setStockQuantity('');
          setStockReason('');
          setSuccess('');
          setError('');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restock stock');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/products/${product._id}`,
        editData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSuccess('Product updated successfully!');
        onUpdate(response.data.data.product);
        setTimeout(() => {
          setShowEditModal(false);
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleDispose = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!stockQuantity || parseInt(stockQuantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }
    
    if (parseInt(stockQuantity) > product.stockQuantity) {
      setError('Cannot dispose more than available stock');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const url = `${API_URL}/products/${product._id}/stock`;
      console.log('Dispose URL:', url);
      console.log('Product ID:', product._id);
      
      const response = await axios.put(
        url,
        {
          action: 'dispose',
          quantity: parseInt(stockQuantity),
          reason: stockReason || 'Stock disposal',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const newQty = response.data.data.product.stockQuantity;
        setSuccess(`Stock disposed successfully! New quantity: ${newQty} Nos`);
        onUpdate(response.data.data.product);
        setTimeout(() => {
          setShowDisposeModal(false);
          setStockQuantity('');
          setStockReason('');
          setSuccess('');
          setError('');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispose stock');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = () => {
    if (product.stockQuantity === 0) {
      return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold border border-red-300">Out of Stock</span>;
    }
    if (product.stockQuantity <= 10) {
      return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold border border-orange-300">Low Stock</span>;
    }
    return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold border border-green-300">In Stock</span>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary-light/20 to-secondary/20 flex items-center justify-center overflow-hidden">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={(e) => e.target.parentElement.innerHTML = '🔧'} />
              ) : (
                <span className="text-3xl">🔧</span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
              <p className="text-sm text-gray-600">{product.brand} | {product.sku}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Success/Error Messages */}
        {(error || success) && (
          <div className="p-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b bg-gray-50">
          <div className="flex gap-1 px-6 pt-4">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 font-semibold rounded-t-lg transition-colors ${
                activeTab === 'details'
                  ? 'bg-white text-primary border-t-2 border-l-2 border-r-2 border-primary'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📋 Product Details
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-6 py-3 font-semibold rounded-t-lg transition-colors ${
                activeTab === 'pricing'
                  ? 'bg-white text-primary border-t-2 border-l-2 border-r-2 border-primary'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              💰 Pricing & Tax
            </button>
            <button
              onClick={() => setActiveTab('compatibility')}
              className={`px-6 py-3 font-semibold rounded-t-lg transition-colors ${
                activeTab === 'compatibility'
                  ? 'bg-white text-primary border-t-2 border-l-2 border-r-2 border-primary'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🚗 Vehicle Compatibility
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="grid grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Basic Information</h3>
                <div>
                  <label className="text-sm text-gray-600">Product Name</label>
                  <p className="font-medium text-gray-900">{product.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">SKU</label>
                  <p className="font-mono text-sm bg-gray-100 px-3 py-1 rounded inline-block">{product.sku}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Barcode</label>
                  <p className="font-medium text-gray-900">{product.barcode || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Brand</label>
                  <p className="font-medium text-gray-900">{product.brand || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Category</label>
                  <p className="font-medium text-gray-900 capitalize">{product.category?.replace('-', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <div className="mt-1">{getStatusBadge()}</div>
                </div>
              </div>

              {/* Stock Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Stock Information</h3>
                <div>
                  <label className="text-sm text-gray-600">Current Stock</label>
                  <p className="text-2xl font-bold text-gray-900">{product.stockQuantity} Nos</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Reorder Level</label>
                  <p className="font-medium text-gray-900">{product.reorderLevel} Nos</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Expiry Date</label>
                  <p className="font-medium text-gray-900">{formatDate(product.expiryDate)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Created At</label>
                  <p className="font-medium text-gray-900">{formatDate(product.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Supplier</label>
                  <p className="font-medium text-gray-900">{product.supplier?.name || 'N/A'}</p>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="col-span-2">
                  <label className="text-sm text-gray-600">Description</label>
                  <p className="font-medium text-gray-900 mt-1">{product.description}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Pricing</h3>
                <div>
                  <label className="text-sm text-gray-600">Cost Price</label>
                  <p className="font-medium text-gray-900">₹{product.costPrice?.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Selling Price</label>
                  <p className="font-medium text-gray-900">₹{product.sellingPrice?.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">MRP</label>
                  <p className="font-medium text-gray-900">₹{product.mrp?.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Discount</label>
                  <p className="font-medium text-gray-900">{product.discount || 0}%</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Profit Margin</label>
                  <p className="font-medium text-green-600">₹{(product.sellingPrice - product.costPrice)?.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Tax Details</h3>
                <div>
                  <label className="text-sm text-gray-600">GST Rate</label>
                  <p className="font-medium text-gray-900">{product.gstRate || 18}%</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">CGST @ {(product.gstRate || 18) / 2}%</label>
                  <p className="font-medium text-gray-900">₹{((product.sellingPrice || 0) * (product.gstRate || 18) / 200).toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">SGST @ {(product.gstRate || 18) / 2}%</label>
                  <p className="font-medium text-gray-900">₹{((product.sellingPrice || 0) * (product.gstRate || 18) / 200).toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Total Tax Amount</label>
                  <p className="font-medium text-gray-900">₹{((product.sellingPrice || 0) * (product.gstRate || 18) / 100).toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Total with Tax</label>
                  <p className="font-bold text-gray-900">₹{((product.sellingPrice || 0) * (1 + (product.gstRate || 18) / 100)).toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compatibility' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Vehicle Compatibility</h3>
              {product.vehicleCompatibility && product.vehicleCompatibility.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {product.vehicleCompatibility.map((vehicle, index) => (
                    <div key={index} className="bg-gray-100 rounded-lg px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">{vehicle}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No vehicle compatibility data available</p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t p-6 bg-gray-50">
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => setShowStockModal(true)}
              className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              📦 Restock
            </button>
            <button
              onClick={() => setShowDisposeModal(true)}
              className="px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              🗑️ Dispose
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Stock Update Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">📦 Restock Product</h3>
              <p className="text-sm text-gray-600 mt-1">Current Stock: <span className="font-semibold">{product.stockQuantity} Nos</span></p>
            </div>
            <form onSubmit={handleStockUpdate} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity to Add *
                </label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (Optional)
                </label>
                <textarea
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., New shipment received"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Restock'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowStockModal(false); setStockQuantity(''); setStockReason(''); setError(''); }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispose Modal */}
      {showDisposeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">🗑️ Dispose Stock</h3>
              <p className="text-sm text-gray-600 mt-1">Available Stock: <span className="font-semibold">{product.stockQuantity} Nos</span></p>
            </div>
            <form onSubmit={handleDispose} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity to Dispose *
                </label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  required
                  min="1"
                  max={product.stockQuantity}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter quantity"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum: {product.stockQuantity} Nos</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason *
                </label>
                <select
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select reason</option>
                  {disposeReasons.map((reason, index) => (
                    <option key={index} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Dispose'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowDisposeModal(false); setStockQuantity(''); setStockReason(''); setError(''); }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">✏️ Edit Product</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            <form onSubmit={handleEditProduct} className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {success}
                </div>
              )}
              
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                    <input
                      type="text"
                      value={editData.sku}
                      onChange={(e) => setEditData({ ...editData, sku: e.target.value.toUpperCase() })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                    <input
                      type="text"
                      value={editData.barcode || ''}
                      onChange={(e) => setEditData({ ...editData, barcode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <input
                      type="text"
                      value={editData.brand || ''}
                      onChange={(e) => setEditData({ ...editData, brand: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={editData.category}
                      onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="engine-oils">Engine Oils</option>
                      <option value="brake-parts">Brake Parts</option>
                      <option value="filters">Filters</option>
                      <option value="batteries">Batteries</option>
                      <option value="spark-plugs">Spark Plugs</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      value={editData.stockQuantity}
                      onChange={(e) => setEditData({ ...editData, stockQuantity: parseInt(e.target.value) })}
                      required
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price *</label>
                    <input
                      type="number"
                      value={editData.costPrice}
                      onChange={(e) => setEditData({ ...editData, costPrice: parseFloat(e.target.value) })}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
                    <input
                      type="number"
                      value={editData.sellingPrice}
                      onChange={(e) => setEditData({ ...editData, sellingPrice: parseFloat(e.target.value) })}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MRP *</label>
                    <input
                      type="number"
                      value={editData.mrp}
                      onChange={(e) => setEditData({ ...editData, mrp: parseFloat(e.target.value) })}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                    <input
                      type="number"
                      value={editData.discount || 0}
                      onChange={(e) => setEditData({ ...editData, discount: parseFloat(e.target.value) })}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate %</label>
                    <select
                      value={editData.gstRate || 18}
                      onChange={(e) => setEditData({ ...editData, gstRate: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

              {/* Vehicle Compatibility */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Compatibility</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compatible Vehicles (comma separated)
                  </label>
                  <textarea
                    value={editData.vehicleCompatibility?.join(', ') || ''}
                    onChange={(e) => setEditData({ 
                      ...editData, 
                      vehicleCompatibility: e.target.value.split(',').map(v => v.trim()).filter(v => v)
                    })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Honda City 2020, Maruti Swift 2019, Toyota Corolla"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailModal;
