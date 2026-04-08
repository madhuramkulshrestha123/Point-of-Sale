import React from 'react';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 mb-2 shadow-sm hover:shadow-md transition-all">
      {/* Product Info - Cleaner Layout */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-800 leading-tight">
            {item.name}
          </h4>
          <p className="text-xs text-gray-500 mt-0.5 font-mono bg-gray-100 px-1.5 py-0.5 rounded inline-block">{item.sku}</p>
          {item.brand && (
            <p className="text-xs text-gray-600 mt-0.5 font-medium">
              {item.brand}
            </p>
          )}
        </div>
        
        <button
          onClick={() => onRemove(item.id)}
          className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all ml-2 p-1 rounded-lg"
          title="Remove item"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Quantity Controls - Circular Buttons */}
      <div className="flex items-center justify-between gap-3">
        {/* Quantity Controls */}
        <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => item.quantity > 1 ? onUpdateQuantity(item.id, item.quantity - 1) : onRemove(item.id)}
            className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-gray-50 active:scale-95 transition-all font-bold text-gray-700 border border-gray-200"
          >
            −
          </button>
          
          <span className="w-10 text-center font-bold text-sm text-gray-800">{item.quantity}</span>
          
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-gray-50 active:scale-95 transition-all font-bold text-gray-700 border border-gray-200"
          >
            +
          </button>
        </div>
        
        {/* Pricing - Better Hierarchy */}
        <div className="text-right">
          <p className="text-xs text-gray-500 font-medium">₹{(item.price || 0).toLocaleString()} each</p>
          <p className="text-base font-bold text-green-600">
            ₹{((item.price || 0) * item.quantity).toLocaleString()}
          </p>
          {item.taxRate !== undefined && (
            <p className="text-xs text-blue-600 font-medium mt-0.5">
              GST: {item.taxRate}%
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItem;
