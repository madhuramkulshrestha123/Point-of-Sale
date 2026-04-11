import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, categories = [], selectedCategory, searchQuery, onAddToCart, favorites, onToggleFavorite, onCategoryChange }) => {
  // Filter products based on category and search query
  const filteredProducts = products.filter(product => {
    if (selectedCategory === 'all') return true;
    
    // Case-insensitive comparison with trim
    const productCategory = (product.category || '').trim().toLowerCase();
    const selectedCat = selectedCategory.trim().toLowerCase();
    const matchesCategory = productCategory === selectedCat;
    
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.barcode && product.barcode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.vehicleCompatibility && product.vehicleCompatibility.some(v => 
        v.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    
    return matchesCategory && matchesSearch;
  });

  // Debug logging
  if (selectedCategory !== 'all') {
    console.log('Selected category:', selectedCategory);
    console.log('Products categories:', products.map(p => `"${p.category}"`));
    console.log('Filtered count:', filteredProducts.length, 'out of', products.length);
  }

  // Create category image map from categories
  const categoryImageMap = {};
  categories.forEach(cat => {
    categoryImageMap[cat.name] = cat.image;
  });
  
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header with count - Cleaner */}
      <div className="bg-white px-3 py-2 border-b border-gray-200 shadow-sm md:px-4 md:py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2 md:text-lg">
            📦 Products
            <span className="ml-1 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {filteredProducts.length}
            </span>
          </h2>
          
          {/* Mobile Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange && onCategoryChange(e.target.value)}
            className="md:hidden text-xs font-medium px-2 py-1.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          
          {searchQuery && (
            <div className="hidden md:block text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 truncate max-w-[120px] md:max-w-none">
              🔍 "{searchQuery}"
            </div>
          )}
        </div>
      </div>
      
      {/* Product Grid - Better Spacing */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4">
        {filteredProducts.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-5xl mb-3 opacity-50 md:text-6xl">🔍</div>
              <p className="text-sm font-medium text-gray-600 md:text-base">No products found</p>
              <p className="text-xs mt-1 text-gray-500 md:text-sm">Try a different search or category</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 auto-rows-fr md:grid-cols-4 md:gap-4">
            {filteredProducts.map((product) => {
              const productData = {
                id: product._id,
                name: product.name,
                price: product.sellingPrice ? Number(product.sellingPrice) : 0,
                mrp: product.mrp ? Number(product.mrp) : 0,
                sku: product.sku || '',
                category: product.category || '',
                brand: product.brand || '',
                stock: product.stockQuantity || 0,
                image: product.image || '',
                costPrice: product.costPrice ? Number(product.costPrice) : 0,
                gstRate: product.gstRate || 18, // Include GST rate
                categoryImage: categoryImageMap[product.category] || product.categoryImage,
              };
              
              return (
                <ProductCard
                  key={product._id}
                  product={productData}
                  onAddToCart={onAddToCart}
                  isFavorite={favorites?.includes(product._id)}
                  onToggleFavorite={() => onToggleFavorite(product._id)}
                />
              );
            })}
          </div>
        )}
      </div>
      
      {/* Footer - Cleaner Keyboard Shortcuts */}
      <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 text-xs text-gray-600 md:px-4 md:py-2.5">
        <div className="flex items-center gap-2 font-medium md:gap-3">
          <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 font-mono text-[10px] md:text-xs">Enter</kbd> Checkout</span>
          <span className="hidden sm:inline"><kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 font-mono text-[10px] md:text-xs">F1</kbd> Help</span>
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
