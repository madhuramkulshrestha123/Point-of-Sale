import React from 'react';

// Category icons mapping
const CATEGORY_ICONS = {
  'Engine Oil': { icon: '🛢️', color: 'from-blue-400 to-blue-600' },
  'Filters': { icon: '🔧', color: 'from-green-400 to-green-600' },
  'Brakes': { icon: '🔴', color: 'from-red-400 to-red-600' },
  'Battery': { icon: '🔋', color: 'from-yellow-400 to-yellow-600' },
  'Tires': { icon: '⚫', color: 'from-gray-600 to-gray-800' },
  'Accessories': { icon: '🔩', color: 'from-purple-400 to-purple-600' },
};

const InventoryCard = ({ product, onView, onEdit }) => {
  const getStatusBadge = () => {
    if (product.stockQuantity === 0) {
      return (
        <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold border border-red-300">
          Out of Stock
        </span>
      );
    }
    if (product.stockQuantity <= 10) {
      return (
        <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-semibold border border-yellow-300">
          Low Stock
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold border border-green-300">
        In Stock
      </span>
    );
  };

  const isLowStock = product.stockQuantity <= product.reorderLevel;
  const isOutOfStock = product.stockQuantity === 0;

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-3 border transition-all ${
        isOutOfStock
          ? 'border-red-300 bg-red-50'
          : isLowStock
          ? 'border-yellow-300 bg-yellow-50'
          : 'border-gray-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Category Icon */}
        {(() => {
          // Check if categoryImage is a URL
          if (product.categoryImage && product.categoryImage.startsWith('http')) {
            return (
              <img
                src={product.categoryImage}
                alt={product.category}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
            );
          }
          // Otherwise use predefined icons
          return (
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${CATEGORY_ICONS[product.categoryImage]?.color || 'from-gray-400 to-gray-600'} flex items-center justify-center text-xl flex-shrink-0`}>
              {CATEGORY_ICONS[product.categoryImage]?.icon || '📦'}
            </div>
          );
        })()}
        
        {/* Product Info */}
        <div className="flex-1 min-w-0">
          {/* Product Name & Category */}
          <div className="mb-2">
            <h3 className="text-sm font-bold text-gray-800 truncate mb-0.5">
              {product.name}
            </h3>
            {product.brand && (
              <p className="text-xs text-gray-500 truncate">{product.brand}</p>
            )}
            {product.category && (
              <p className="text-[10px] text-gray-400 capitalize mt-0.5">
                {product.category}
              </p>
            )}
          </div>

          {/* Stock & Price Row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-600 font-medium">Stock:</span>
              <span
                className={`text-sm font-bold ${
                  isOutOfStock
                    ? 'text-red-600'
                    : isLowStock
                    ? 'text-yellow-600'
                    : 'text-gray-800'
                }`}
              >
                {product.stockQuantity}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-600 font-medium">Price:</span>
              <span className="text-sm font-bold text-green-600">
                ₹{product.sellingPrice?.toLocaleString()}
              </span>
            </div>
          </div>

          {/* SKU & Supplier */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            {product.sku && (
              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                {product.sku}
              </span>
            )}
            {product.supplier?.name && (
              <span className="truncate">{product.supplier.name}</span>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between gap-2">
            {getStatusBadge()}
            
            {/* Expiry Date (if applicable) */}
            {product.expiryDate && (
              <span className="text-[10px] text-gray-500">
                Exp: {new Date(product.expiryDate).toLocaleDateString('en-IN', { 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(product);
            }}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors active:scale-95"
            style={{ minHeight: '44px' }}
          >
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
            className="px-3 py-2 bg-gray-600 text-white rounded-lg text-xs font-semibold hover:bg-gray-700 transition-colors active:scale-95"
            style={{ minHeight: '44px' }}
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryCard;
