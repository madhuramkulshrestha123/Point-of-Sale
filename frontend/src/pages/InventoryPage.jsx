import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SummaryCards from '../components/inventory/SummaryCards';
import InventorySummaryCards from '../components/inventory/InventorySummaryCards';
import InventoryTable from '../components/inventory/InventoryTable';
import InventoryList from '../components/inventory/InventoryList';
import LowStockAlert from '../components/inventory/LowStockAlert';
import AddProductModal from '../components/inventory/AddProductModal';
import ProductDetailModal from '../components/inventory/ProductDetailModal';
import ManageCategoriesModal from '../components/inventory/ManageCategoriesModal';
import ManageSuppliersModal from '../components/inventory/ManageSuppliersModal';

const API_URL = import.meta.env.VITE_API_URL;

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showLowStockAlert, setShowLowStockAlert] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showSuppliersModal, setShowSuppliersModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
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
    }
  };

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/suppliers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setSuppliers(response.data.data.suppliers);
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
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

  const handleCategorySuccess = (category) => {
    console.log('Category operation successful:', category);
  };

  const handleSupplierSuccess = (supplier) => {
    console.log('Supplier operation successful:', supplier);
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
          <div className="flex gap-2">
            <button 
              onClick={() => setShowSuppliersModal(true)}
              className="px-4 py-2.5 bg-white text-primary border-2 border-primary rounded-lg font-semibold hover:shadow-lg transition-all text-sm md:px-6 md:py-3 md:text-base flex items-center gap-1.5 md:gap-2"
              style={{ minHeight: '44px' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden sm:inline">Manage Suppliers</span>
            </button>
            <button 
              onClick={() => setShowCategoriesModal(true)}
              className="px-4 py-2.5 bg-white text-primary border-2 border-primary rounded-lg font-semibold hover:shadow-lg transition-all text-sm md:px-6 md:py-3 md:text-base flex items-center gap-1.5 md:gap-2"
              style={{ minHeight: '44px' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="hidden sm:inline">Manage Categories</span>
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm md:px-6 md:py-3 md:text-base flex items-center gap-1.5 md:gap-2"
              style={{ minHeight: '44px' }}
            >
              <span className="text-base md:text-xl">+</span>
              <span className="hidden sm:inline">Add Product</span>
            </button>
          </div>
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
                {categories.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
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
              categories={categories}
            />
          )}
        </div>
      </div>

      {/* Manage Categories Modal */}
      <ManageCategoriesModal
        isOpen={showCategoriesModal}
        onClose={() => setShowCategoriesModal(false)}
        onSuccess={handleCategorySuccess}
      />

      {/* Manage Suppliers Modal */}
      <ManageSuppliersModal
        isOpen={showSuppliersModal}
        onClose={() => setShowSuppliersModal(false)}
        onSuccess={handleSupplierSuccess}
      />

      {/* Add Product Modal - Pass suppliers */}
      <AddProductModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddProductSuccess}
        suppliers={suppliers}
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
