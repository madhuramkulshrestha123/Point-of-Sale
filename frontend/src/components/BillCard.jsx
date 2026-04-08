import React from 'react';

const MobileBillCard = ({ bill, onView, onPay, isPending = false }) => {
  const getStatusBadge = () => {
    const status = bill.paymentStatus || (bill.finalAmount > (bill.amountPaid || 0) ? 'pending' : 'completed');
    
    if (status === 'completed') {
      return (
        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold border border-green-300">
          Completed
        </span>
      );
    }
    if (status === 'partial') {
      return (
        <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold border border-orange-300">
          Partial
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-semibold border border-yellow-300">
        Pending
      </span>
    );
  };

  const getPaymentMethodBadge = () => {
    const method = bill.paymentMethod;
    if (!method) return null;

    return (
      <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold border border-blue-300">
        {method.toUpperCase()}
      </span>
    );
  };

  const saleData = bill.sale || bill;
  const customerName = saleData.customer?.name || 'Walk-in';
  const amount = bill.finalAmount || bill.amount || 0;
  const date = new Date(bill.createdAt || saleData.createdAt).toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      {/* Top Row: Invoice & Date */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-800 font-mono truncate">
            #{bill.invoiceNumber || saleData.invoiceNumber}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{date}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {getStatusBadge()}
          {getPaymentMethodBadge()}
        </div>
      </div>

      {/* Customer Name */}
      <div className="mb-2">
        <p className="text-xs text-gray-600">
          <span className="font-medium">Customer:</span> {customerName}
        </p>
      </div>

      {/* Amount */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(bill);
            }}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
            style={{ minHeight: '44px' }}
          >
            View
          </button>
          {isPending && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPay(bill);
              }}
              className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors"
              style={{ minHeight: '44px' }}
            >
              Pay Now
            </button>
          )}
        </div>
        <p className="text-base font-bold text-gray-800">₹{amount.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default MobileBillCard;
