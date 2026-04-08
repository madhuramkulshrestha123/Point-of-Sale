import React from 'react';

const MobileCustomerSummaryCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers || 0,
      color: 'bg-blue-50',
      borderColor: 'border-blue-300',
      valueColor: 'text-blue-700',
    },
    {
      title: 'Active',
      value: stats.activeCustomers || 0,
      color: 'bg-green-50',
      borderColor: 'border-green-300',
      valueColor: 'text-green-700',
    },
    {
      title: 'Revenue',
      value: `₹${(stats.totalRevenue || 0).toLocaleString()}`,
      color: 'bg-purple-50',
      borderColor: 'border-purple-300',
      valueColor: 'text-purple-700',
    },
    {
      title: 'Pending',
      value: `₹${(stats.totalPending || 0).toLocaleString()}`,
      color: 'bg-orange-50',
      borderColor: 'border-orange-300',
      valueColor: 'text-orange-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.color} border-2 ${card.borderColor} rounded-lg p-3 shadow-sm`}
        >
          <p className="text-[10px] font-medium text-gray-600 mb-1 truncate">{card.title}</p>
          <p className={`text-lg font-extrabold ${card.valueColor}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default MobileCustomerSummaryCards;
