import React, { useState } from 'react';

// Category image mapping
const categoryImageMap = {
  'engine-oils': '/imgs/engine_oil.png',
  'brake-parts': '/imgs/brake parts.png',
  'filters': '/imgs/filter.png',
  'batteries': '/imgs/battery.png',
  'spark-plugs': '/imgs/spark_plug.png',
  'accessories': '/imgs/acceosories.png',
};

// Default image for all products
const defaultCategoryImage = '/imgs/all_products.svg';

// Fallback emojis for categories
const categoryEmojis = {
  'all': '📦',
  'engine-oils': '🛢️',
  'brake-parts': '🔧',
  'filters': '🌪️',
  'batteries': '🔋',
  'spark-plugs': '⚡',
  'accessories': '✨',
};

const InventoryTable = ({ products, searchQuery, categoryFilter, statusFilter, onSearch, onCategoryFilter, onStatusFilter, onProductClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'low') {
      matchesStatus = product.stockQuantity <= 10;
    } else if (statusFilter === 'out') {
      matchesStatus = product.stockQuantity === 0;
    } else if (statusFilter === 'in') {
      matchesStatus = product.stockQuantity > 10;
    }
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (product) => {
    if (product.stockQuantity === 0) {
      return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-300">Out of Stock</span>;
    }
    if (product.stockQuantity <= 10) {
      return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold border border-orange-300">Low Stock</span>;
    }
    return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-300">In Stock</span>;
  };

  const categories = ['all', 'engine-oils', 'brake-parts', 'filters', 'batteries', 'spark-plugs', 'accessories'];

  return (
    <div className="bg-white rounded-xl shadow-md border border-primary-light/30 overflow-hidden">
      {/* Filters Header */}
      <div className="p-6 border-b border-primary-light/30 bg-gradient-to-r from-accent/10 to-secondary/10">
        <div className="grid grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="🔍 Search by name or SKU..."
              className="w-full px-4 py-2.5 border-2 border-primary-light/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilter(e.target.value)}
            className="px-4 py-2.5 border-2 border-primary-light/50 rounded-lg focus:ring-2 focus:ring-primary text-sm font-medium"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilter(e.target.value)}
            className="px-4 py-2.5 border-2 border-primary-light/50 rounded-lg focus:ring-2 focus:ring-primary text-sm font-medium"
          >
            <option value="all">All Status</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary-light/30">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Expiry</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Supplier</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedProducts.map((product) => (
              <tr 
                key={product._id} 
                className="hover:bg-accent/10 transition-colors group cursor-pointer"
                onClick={() => onProductClick && onProductClick(product)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-light/20 to-secondary/20 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={(e) => {
                          // Try category image first
                          const catImage = categoryImageMap[product.category];
                          if (catImage) {
                            e.target.src = catImage;
                            e.target.onerror = () => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `<span class="text-xl">${categoryEmojis[product.category] || '🔧'}</span>`;
                            };
                          } else {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<span class="text-xl">${categoryEmojis[product.category] || '🔧'}</span>`;
                          }
                        }} />
                      ) : (
                        <img src={categoryImageMap[product.category] || defaultCategoryImage} alt={product.category} className="w-full h-full object-cover" onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<span class="text-xl">${categoryEmojis[product.category] || '📦'}</span>`;
                        }} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{product.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">{product.sku}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-700 capitalize">{product.category?.replace('-', ' ')}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-bold ${product.stockQuantity <= 10 ? 'text-orange-600' : 'text-gray-800'}`}>
                    {product.stockQuantity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(product)}
                </td>
                <td className="px-6 py-4">
                  {product.expiryDate ? (
                    <span className="text-xs text-gray-600">
                      {new Date(product.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-700">{product.supplier?.name || 'N/A'}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => onProductClick && onProductClick(product)}
                      className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-primary-light/30 bg-gradient-to-r from-accent/10 to-secondary/10 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing <span className="font-bold text-gray-800">{startIndex + 1}</span> to{' '}
          <span className="font-bold text-gray-800">{Math.min(startIndex + itemsPerPage, filteredProducts.length)}</span> of{' '}
          <span className="font-bold text-gray-800">{filteredProducts.length}</span> products
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border-2 border-primary-light rounded-lg text-sm font-semibold hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border-2 border-primary-light rounded-lg text-sm font-semibold hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryTable;
