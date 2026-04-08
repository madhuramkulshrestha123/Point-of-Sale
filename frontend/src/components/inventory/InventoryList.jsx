import React, { useState } from 'react';
import InventoryCard from './InventoryCard';

const InventoryList = ({ 
  products, 
  searchQuery, 
  categoryFilter, 
  statusFilter, 
  onViewProduct, 
  onEditProduct 
}) => {
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

  return (
    <div className="space-y-4">
      {/* Products List */}
      {paginatedProducts.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="text-5xl mb-3 opacity-50">📦</div>
          <p className="text-base font-medium text-gray-600 mb-1">No products found</p>
          <p className="text-sm text-gray-500">Try adjusting filters or search</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-2">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-800">{filteredProducts.length}</span> products found
            </p>
          </div>
          
          <div className="space-y-3">
            {paginatedProducts.map((product) => (
              <InventoryCard
                key={product._id}
                product={product}
                onView={onViewProduct}
                onEdit={onEditProduct}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ minHeight: '44px' }}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 font-medium">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ minHeight: '44px' }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InventoryList;
