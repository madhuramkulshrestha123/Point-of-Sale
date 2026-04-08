import React from 'react';

const MobilePaymentSummaryCards = ({ summary, dateFilter }) => {
  const cards = [
    {
      title: 'Total Orders',
      value: summary.todayOrders || 0,
      color: 'bg-blue-50',
      borderColor: 'border-blue-300',
      valueColor: 'text-blue-700',
    },
    {
      title: 'Total Sales',
      value: `₹${(summary.todaySales || 0).toLocaleString()}`,
      color: 'bg-green-50',
      borderColor: 'border-green-300',
      valueColor: 'text-green-700',
    },
    {
      title: dateFilter === 'today' ? "Today's Sales" : dateFilter === 'week' ? "This Week" : dateFilter === 'month' ? "This Month" : "Period Sales",
      value: `₹${(summary.monthSales || 0).toLocaleString()}`,
      color: 'bg-purple-50',
      borderColor: 'border-purple-300',
      valueColor: 'text-purple-700',
    },
    {
      title: dateFilter === 'today' ? "Today's Pending" : dateFilter === 'week' ? "This Week" : dateFilter === 'month' ? "This Month" : "Period Pending",
      value: summary.totalPending || 0,
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

export default MobilePaymentSummaryCards;
