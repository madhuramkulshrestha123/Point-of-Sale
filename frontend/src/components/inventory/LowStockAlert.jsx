import React from 'react';

const LowStockAlert = ({ count, onDismiss }) => {
  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-4 shadow-md flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-3xl animate-pulse">⚠️</div>
        <div>
          <h3 className="text-lg font-bold text-orange-800">Low Stock Alert</h3>
          <p className="text-sm text-orange-700 mt-1">
            {count} {count === 1 ? 'item is' : 'items are'} low in stock and need immediate attention
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm">
          🛒 Restock Now
        </button>
        <button 
          onClick={onDismiss}
          className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-white/50 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default LowStockAlert;
