import React from 'react';

const CustomerRow = ({ customer, onView, onEdit, onDelete, onToggleStatus }) => {
  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100">
      <td className="py-3 px-4">
        <div>
          <p className="font-semibold text-gray-800">{customer.name}</p>
          {customer.gstNumber && (
            <p className="text-xs text-gray-500">GST: {customer.gstNumber}</p>
          )}
        </div>
      </td>
      <td className="py-3 px-4 text-gray-700">{customer.phone}</td>
      <td className="py-3 px-4 text-gray-700">{customer.email || '-'}</td>
      <td className="py-3 px-4 text-right font-semibold text-gray-800">
        {customer.totalOrders || 0}
      </td>
      <td className="py-3 px-4 text-right font-semibold text-gray-800">
        ₹{(customer.totalSpent || 0).toLocaleString()}
      </td>
      <td className="py-3 px-4 text-right font-semibold text-orange-600">
        ₹{(customer.totalDue || 0).toLocaleString()}
      </td>
      <td className="py-3 px-4 text-right font-semibold text-blue-600">
        {customer.loyaltyPoints || 0}
      </td>
      <td className="py-3 px-4 text-gray-700">
        {formatDate(customer.lastPurchaseDate)}
      </td>
      <td className="py-3 px-4">
        <button
          onClick={() => onToggleStatus(customer._id)}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
            customer.status === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {customer.status === 'active' ? 'Active' : 'Inactive'}
        </button>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(customer)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
          >
            View
          </button>
          <button
            onClick={() => onEdit(customer)}
            className="text-green-600 hover:text-green-800 text-sm font-medium hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(customer._id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CustomerRow;
