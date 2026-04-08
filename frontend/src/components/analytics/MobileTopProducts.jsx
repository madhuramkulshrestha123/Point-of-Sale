import React from 'react';

const MobileTopProducts = ({ products, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center justify-center" style={{ height: '150px' }}>
          <p className="text-gray-500 text-sm">Loading products...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-gray-800">Top Products</h3>
        </div>
        <div className="flex items-center justify-center" style={{ height: '150px' }}>
          <p className="text-gray-500 text-sm">No products data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Top Products</h3>
          <p className="text-xs text-gray-500 mt-0.5">Best performers</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {products.slice(0, 5).map((product) => (
          <div 
            key={product.id}
            className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100"
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-xs">
              {product.rank}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate">{product.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{product.category}</p>
            </div>

            {/* Stats */}
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-bold text-green-600">₹{product.revenue.toLocaleString()}</p>
              <p className="text-[10px] text-gray-500">{product.unitsSold} sold</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileTopProducts;
