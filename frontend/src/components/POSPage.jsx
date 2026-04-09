import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchProducts as fetchProductsAPI } from '../api';
import NavigationSidebar from './NavigationSidebar';
import MobileNavbar from './MobileNavbar';
import SidebarCategories from './SidebarCategories';
import ProductGrid from './ProductGrid';
import CartPanel from './CartPanel';
import CartDrawer from './CartDrawer';
import FavoritesBar from './FavoritesBar';
import CheckoutModal from './CheckoutModal';
import ProfileModal from './ProfileModal';
import InventoryPage from '../pages/InventoryPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import PaymentsHistoryPage from './PaymentsHistoryPage';
import EmployeePage from '../pages/EmployeePage';
import CRMPage from '../pages/CRMPage';
import usePOSStore from '../store/posStore';

const API_URL = import.meta.env.VITE_API_URL;

// Category mapping for display
const categoryMap = {
  'engine-oils': 'Engine Oils',
  'brake-parts': 'Brake Parts',
  'filters': 'Filters',
  'batteries': 'Batteries',
  'spark-plugs': 'Spark Plugs',
  'accessories': 'Accessories',
};

const POSPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('pos');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const { addToCart, clearCart, getTotal, getSubtotal } = usePOSStore();
  
  // Fetch products from backend
  useEffect(() => {
    if (activeMenu === 'pos') {
      fetchProducts();
    }
  }, [activeMenu]);
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found - redirecting to login');
        return;
      }
      
      console.log('Fetching products with token:', token.substring(0, 20) + '...');
      
      // Use offline-capable API function
      const productsData = await fetchProductsAPI();
      
      // If API returned array directly, use it
      if (Array.isArray(productsData)) {
        setProducts(productsData);
      } else if (productsData.products) {
        // If API returned {products: [...]}
        setProducts(productsData.products);
      } else if (productsData.data?.products) {
        // If API returned {data: {products: [...]}}
        setProducts(productsData.data.products);
      } else {
        console.error('Unexpected products data format:', productsData);
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      console.error('Error message:', err.message);
      
      // If unauthorized, clear auth and reload
      if (err.response?.status === 401) {
        console.error('Token invalid - clearing auth');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
      }
      
      // Show error to user
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Enter - Checkout
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
        const activeElement = document.activeElement;
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'SELECT') {
          e.preventDefault();
          handleCheckout();
        }
      }
      
      // Backspace - Remove last item (when not in input)
      if (e.key === 'Backspace') {
        const activeElement = document.activeElement;
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'SELECT') {
          // Could implement remove last item here
        }
      }
      
      // F1 - Help
      if (e.key === 'F1') {
        e.preventDefault();
        alert('Keyboard Shortcuts:\n\nEnter - Checkout\nBackspace - Remove item\nF1 - Help\nCtrl+K - Search');
      }
      
      // Ctrl+K - Focus search
      if (e.key === 'k' && e.ctrlKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Close search history when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleCheckout = () => {
    const total = getTotal();
    if (total > 0) {
      setShowCheckout(true);
      // Here you would open a checkout modal or navigate to checkout page
    }
  };
  
  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    // Menu routing handled by conditional rendering
  };
  
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };
  
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Hide history when user starts typing
    if (value) {
      setShowSearchHistory(false);
    }
  };

  const handleSearchFocus = () => {
    // Show history only when search is empty
    if (!searchQuery && searchHistory.length > 0) {
      setShowSearchHistory(true);
    }
  };

  const handleSearchHistoryClick = (query) => {
    setSearchQuery(query);
    setShowSearchHistory(false);
    // Filter products based on the selected history item
    searchInputRef.current?.focus();
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
    setShowSearchHistory(false);
  };

  const saveSearchToHistory = (query) => {
    if (!query || query.trim() === '') return;
    
    const newHistory = [query, ...searchHistory.filter(q => q !== query)].slice(0, 3);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };
  
  const toggleFavorite = (productId) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };
  
  const handleBarcodeScan = (barcode) => {
    // Search for product by SKU or barcode in fetched products
    const scannedProduct = products.find(p => 
      p.sku.toLowerCase() === barcode.toLowerCase() ||
      p.barcode?.toLowerCase() === barcode.toLowerCase()
    );
    
    if (scannedProduct && scannedProduct.stockQuantity > 0) {
      // Create properly formatted product object
      const product = {
        id: scannedProduct._id,
        name: scannedProduct.name,
        price: scannedProduct.sellingPrice ? Number(scannedProduct.sellingPrice) : 0,
        mrp: scannedProduct.mrp ? Number(scannedProduct.mrp) : 0,
        sku: scannedProduct.sku || '',
        category: scannedProduct.category || '',
        brand: scannedProduct.brand || '',
        stock: scannedProduct.stockQuantity || 0,
        image: scannedProduct.image || '',
        costPrice: scannedProduct.costPrice ? Number(scannedProduct.costPrice) : 0,
        gstRate: scannedProduct.gstRate || 18, // Include GST rate
      };
      addToCart(product);
    } else {
      alert('Product not found or out of stock!');
    }
  };
  
  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* LEFT MOST - Main Navigation (Desktop Only) */}
      <div className="hidden md:flex flex-shrink-0">
        <NavigationSidebar 
          onMenuClick={handleMenuClick}
          activeMenu={activeMenu}
          user={user}
          onLogout={onLogout}
        />
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileNavbar 
        activeMenu={activeMenu}
        onMenuClick={handleMenuClick}
      />
      
      {/* Conditional rendering based on active menu */}
      {activeMenu === 'pos' ? (
        <>
          {/* LEFT PANEL - Categories (Desktop Only) */}
          <div className="hidden md:block md:w-64 md:flex-shrink-0 md:border-r md:border-gray-200 md:bg-white md:shadow-md">
            <SidebarCategories
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategoryChange}
            />
          </div>
          
          {/* CENTER PANEL - Product Grid */}
          <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
            {/* Mobile Header Section */}
            <div className="md:hidden">
              {/* Top Header - Business Name */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-center shadow-md">
                <h1 className="text-xl font-bold text-white" style={{ fontFamily: '"Saira Stencil", cursive, sans-serif' }}>
                  {user?.businessName || 'N.R AUTO PARTS'}
                </h1>
              </div>
              
              {/* Second Row - Profile Button, Search, Cart */}
              <div className="bg-white px-3 py-2 border-b border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                  {/* Profile Button */}
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-md"
                    title="Business Profile"
                  >
                    <span className="text-lg font-bold">
                      {user?.businessName?.charAt(0).toUpperCase() || 'N'}
                    </span>
                  </button>
                  
                  {/* Search Bar */}
                  <div className="flex-1 relative" ref={searchContainerRef}>
                    <input
                      ref={searchInputRef}
                      id="product-search-mobile"
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={handleSearchFocus}
                      onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                          saveSearchToHistory(searchQuery.trim());
                          setShowSearchHistory(false);
                        }
                      }}
                      placeholder="🔍 Search products..."
                      className="w-full h-10 px-4 pl-10 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white shadow-sm"
                      autoComplete="off"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base">
                      🔍
                    </span>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  
                  {/* Cart Button */}
                  <button
                    onClick={() => setShowCartDrawer(true)}
                    className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors shadow-md relative"
                  >
                    <span className="text-lg">🛒</span>
                    {getSubtotal() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {Math.ceil(getSubtotal() / 100)}
                      </span>
                    )}
                  </button>
                </div>
                
                {/* Search History Dropdown */}
                {showSearchHistory && searchHistory.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 mx-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-2 border-b border-gray-100 flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Recent Searches</span>
                      <button
                        onClick={clearSearchHistory}
                        className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                    <ul className="py-1">
                      {searchHistory.map((query, index) => (
                        <li key={index}>
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSearchHistoryClick(query);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                          >
                            <span className="text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </span>
                            <span className="text-sm text-gray-700 truncate">{query}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            {/* Desktop Search Bar */}
            <div className="hidden md:block bg-white px-4 py-3 border-b border-gray-200 shadow-sm" ref={searchContainerRef}>
              <input
                ref={searchInputRef}
                id="product-search"
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    saveSearchToHistory(searchQuery.trim());
                    setShowSearchHistory(false);
                  }
                }}
                placeholder="🔍  Search products by name, brand, SKU, barcode, or vehicle compatibility... (Ctrl+K)"
                className="w-full h-12 px-5 pl-12 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white shadow-sm hover:shadow-md"
                autoComplete="off"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-all"
                >
                  ✕
                </button>
              )}
              
              {/* Search History Dropdown */}
              {showSearchHistory && searchHistory.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Recent Searches</span>
                    <button
                      onClick={clearSearchHistory}
                      className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <ul className="py-1">
                    {searchHistory.map((query, index) => (
                      <li key={index}>
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSearchHistoryClick(query);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <span className="text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                          <span className="text-sm text-gray-700 truncate">{query}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Favorites Bar (Desktop Only) */}
            <div className="hidden md:block">
              <FavoritesBar
                favorites={favorites}
                products={products}
                onAddToCart={(product) => {
                  console.log('FavoritesBar product:', product);
                  addToCart(product);
                }}
              />
            </div>
            
            {/* Product Grid */}
            <div className="flex-1 overflow-hidden">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading products...</p>
                  </div>
                </div>
              ) : (
                <ProductGrid
                  products={products}
                  selectedCategory={selectedCategory}
                  searchQuery={searchQuery}
                  onAddToCart={(product) => {
                    console.log('POSPage received product:', product);
                    addToCart(product);
                  }}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
              )}
            </div>
          </div>
          
          {/* RIGHT PANEL - Cart (Desktop Only) */}
          <div className="hidden md:block md:w-96 md:flex-shrink-0 md:bg-white md:shadow-lg">
            <CartPanel onCheckout={handleCheckout} />
          </div>
          
          {/* Checkout Modal */}
          <CheckoutModal 
            isOpen={showCheckout}
            onClose={() => setShowCheckout(false)}
          />
          
          {/* Cart Drawer (Mobile Only) */}
          <CartDrawer
            isOpen={showCartDrawer}
            onClose={() => setShowCartDrawer(false)}
            onCheckout={handleCheckout}
          />
          
          {/* Profile Modal */}
          <ProfileModal
            isOpen={showProfileModal}
            user={user}
            onClose={() => {
              console.log('POSPage: Closing profile modal');
              setShowProfileModal(false);
            }}
            onUpdate={(updatedUser) => {
              // Update localStorage with new user data
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }}
          />
        </>
      ) : activeMenu === 'inventory' ? (
        <div className="flex-1 overflow-hidden pb-16 md:pb-0">
          <InventoryPage />
        </div>
      ) : activeMenu === 'analytics' ? (
        <div className="flex-1 overflow-hidden pb-16 md:pb-0">
          <AnalyticsPage />
        </div>
      ) : activeMenu === 'payments' ? (
        <div className="flex-1 overflow-hidden pb-16 md:pb-0">
          <PaymentsHistoryPage />
        </div>
      ) : activeMenu === 'employee' ? (
        <div className="flex-1 overflow-hidden pb-16 md:pb-0">
          <EmployeePage />
        </div>
      ) : activeMenu === 'crm' ? (
        <div className="flex-1 overflow-hidden pb-16 md:pb-0">
          <CRMPage />
        </div>
      ) : null}
    </div>
  );
};

export default POSPage;
