import React from 'react';
import MobileCustomerCard from './MobileCustomerCard';

const MobileCustomerList = ({ customers, onView, onEdit, onDelete, onToggleStatus }) => {
  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <div className="text-5xl mb-3 opacity-50">👥</div>
        <p className="text-base font-medium text-gray-600 mb-1">
          No customers found
        </p>
        <p className="text-sm text-gray-500">
          Add your first customer to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {customers.map((customer) => (
        <MobileCustomerCard
          key={customer._id}
          customer={customer}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
};

export default MobileCustomerList;
