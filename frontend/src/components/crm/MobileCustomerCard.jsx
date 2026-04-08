import React from 'react';

const MobileCustomerCard = ({ customer, onView, onEdit, onDelete, onToggleStatus }) => {
  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border-2 p-3 ${
      customer.status === 'active' ? 'border-green-300' : 'border-gray-300'
    }`}>
      {/* Top Row: Name & Status */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-800 truncate">{customer.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{customer.phone}</p>
          {customer.email && (
            <p className="text-xs text-gray-500 truncate">{customer.email}</p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus(customer._id);
          }}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
            customer.status === 'active'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-gray-100 text-gray-600 border border-gray-300'
          }`}
          style={{ minHeight: '32px' }}
        >
          {customer.status === 'active' ? 'Active' : 'Inactive'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="bg-gray-50 rounded p-2">
          <p className="text-[9px] text-gray-500">Orders</p>
          <p className="text-sm font-bold text-gray-800">{customer.totalOrders || 0}</p>
        </div>
        <div className="bg-purple-50 rounded p-2">
          <p className="text-[9px] text-gray-500">Spent</p>
          <p className="text-sm font-bold text-purple-700">₹{(customer.totalSpent || 0).toLocaleString()}</p>
        </div>
        <div className={`${(customer.totalDue || 0) > 0 ? 'bg-orange-50' : 'bg-gray-50'} rounded p-2`}>
          <p className="text-[9px] text-gray-500">Due</p>
          <p className={`text-sm font-bold ${(customer.totalDue || 0) > 0 ? 'text-orange-700' : 'text-gray-800'}`}>
            ₹{(customer.totalDue || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Points:</span>
            <span className="text-xs font-bold text-blue-600">{customer.loyaltyPoints || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Last:</span>
            <span className="text-xs text-gray-600">{formatDate(customer.lastPurchaseDate)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView(customer);
          }}
          className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors"
          style={{ minHeight: '44px' }}
        >
          View Details
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(customer);
          }}
          className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors"
          style={{ minHeight: '44px' }}
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(customer._id);
          }}
          className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
          style={{ minHeight: '44px' }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default MobileCustomerCard;
