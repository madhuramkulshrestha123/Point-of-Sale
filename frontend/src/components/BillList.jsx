import React from 'react';
import MobileBillCard from './BillCard';

const MobileBillList = ({ bills, onViewBill, onPayNow, isPending = false }) => {
  if (bills.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <div className="text-5xl mb-3 opacity-50">📋</div>
        <p className="text-base font-medium text-gray-600 mb-1">
          No bills found
        </p>
        <p className="text-sm text-gray-500">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bills.map((bill) => (
        <MobileBillCard
          key={bill._id}
          bill={bill}
          onView={onViewBill}
          onPay={onPayNow}
          isPending={isPending}
        />
      ))}
    </div>
  );
};

export default MobileBillList;
