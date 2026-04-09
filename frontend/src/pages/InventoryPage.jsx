import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SummaryCards from '../components/inventory/SummaryCards';
import InventorySummaryCards from '../components/inventory/InventorySummaryCards';
import InventoryTable from '../components/inventory/InventoryTable';
import InventoryList from '../components/inventory/InventoryList';
import LowStockAlert from '../components/inventory/LowStockAlert';
import AddProductModal from '../components/inventory/AddProductModal';
import ProductDetailModal from '../components/inventory/ProductDetailModal';

const API_URL = import.meta.env.VITE_API_URL;

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showLowStockAlert, setShowLowStockAlert] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setProducts(response.data.data.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate inventory stats from real data
  const totalProducts = products.length;
  const lowStockItems = products.filter(p => p.stockQuantity <= 10).length;
  const outOfStockItems = products.filter(p => p.stockQuantity === 0).length;
  const expiringSoon = products.filter(p => {
    if (!p.expiryDate) return false;
    const expiryDate = new Date(p.expiryDate);
    const now = new Date();
    const monthsUntilExpiry = (expiryDate - now) / (1000 * 60 * 60 * 24 * 30);
    return monthsUntilExpiry <= 6 && monthsUntilExpiry > 0;
  }).length;

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleCategoryFilter = (category) => {
    setCategoryFilter(category);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const handleAddProductSuccess = (newProduct) => {
    setProducts([newProduct, ...products]);
    setShowAddModal(false);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleProductUpdate = (updatedProduct) => {
    setProducts(products.map(p => 
      p._id === updatedProduct._id ? updatedProduct : p
    ));
    setSelectedProduct(updatedProduct);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-y-auto">
      {/* Header - Mobile Responsive */}
      <div className="bg-white border-b border-primary-light/30 px-3 py-3 shadow-sm md:px-8 md:py-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-800 mb-0.5 md:text-3xl md:mb-1">Inventory Management</h1>
            <p className="text-xs text-gray-500 hidden md:block">Manage your automotive parts and oils inventory</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm md:px-6 md:py-3 md:text-base flex items-center gap-1.5 md:gap-2"
            style={{ minHeight: '44px' }}
          >
            <span className="text-base md:text-xl">+</span>
            <span className="hidden sm:inline">Add Product</span>
          </button>
        </div>
        
        {/* Mobile Search */}
        <div className="mt-3 md:hidden">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-gray-50"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-3 space-y-4 md:p-8 md:space-y-6">
        {/* Low Stock Alert Banner */}
        {showLowStockAlert && lowStockItems > 0 && (
          <LowStockAlert 
            count={lowStockItems} 
            onDismiss={() => setShowLowStockAlert(false)} 
          />
        )}

        {/* Mobile Summary Cards (2 per row) */}
        <div className="md:hidden">
          <InventorySummaryCards 
            totalProducts={totalProducts}
            totalStock={products.reduce((sum, p) => sum + p.stockQuantity, 0)}
            lowStockItems={lowStockItems}
            outOfStockItems={outOfStockItems}
          />
        </div>

        {/* Desktop Summary Cards (4 per row) */}
        <div className="hidden md:block">
          <SummaryCards 
            totalProducts={totalProducts}
            lowStockItems={lowStockItems}
            outOfStockItems={outOfStockItems}
            expiringSoon={expiringSoon}
          />
        </div>

        {/* Mobile Filters & Inventory List */}
        <div className="md:hidden">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-3 space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 bg-white"
                style={{ minHeight: '44px' }}
              >
                <option value="all">All Categories</option>
                <option value="engine-oils">Engine Oils</option>
                <option value="brake-parts">Brake Parts</option>
                <option value="filters">Filters</option>
                <option value="batteries">Batteries</option>
                <option value="spark-plugs">Spark Plugs</option>
                <option value="accessories">Accessories</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 bg-white"
                style={{ minHeight: '44px' }}
              >
                <option value="all">All Status</option>
                <option value="in">In Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Inventory Card List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading products...</p>
              </div>
            </div>
          ) : (
            <InventoryList
              products={products}
              searchQuery={searchQuery}
              categoryFilter={categoryFilter}
              statusFilter={statusFilter}
              onViewProduct={handleProductClick}
              onEditProduct={(product) => {
                // TODO: Implement edit functionality
                handleProductClick(product);
              }}
            />
          )}
        </div>

        {/* Desktop Inventory Table */}
        <div className="hidden md:block">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading products...</p>
              </div>
            </div>
          ) : (
            <InventoryTable 
              products={products}
              searchQuery={searchQuery}
              categoryFilter={categoryFilter}
              statusFilter={statusFilter}
              onSearch={handleSearch}
              onCategoryFilter={handleCategoryFilter}
              onStatusFilter={handleStatusFilter}
              onProductClick={handleProductClick}
            />
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddProductSuccess}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={showProductDetail}
        onClose={() => setShowProductDetail(false)}
        product={selectedProduct}
        onUpdate={handleProductUpdate}
      />
    </div>
  );
};

export default InventoryPage;
