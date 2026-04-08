import React from 'react';

const SummaryCards = ({ totalProducts, lowStockItems, outOfStockItems, expiringSoon }) => {
  const cards = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: '📦',
      color: 'from-primary/20 to-secondary/20',
      borderColor: 'border-primary-light',
      textColor: 'text-gray-800',
      trend: null
    },
    {
      title: 'Low Stock Items',
      value: lowStockItems,
      icon: '⚠️',
      color: 'from-orange-100 to-orange-50',
      borderColor: 'border-orange-300',
      textColor: 'text-orange-700',
      trend: lowStockItems > 0 ? `${lowStockItems} need attention` : 'All good'
    },
    {
      title: 'Out of Stock',
      value: outOfStockItems,
      icon: '🚫',
      color: 'from-red-100 to-red-50',
      borderColor: 'border-red-300',
      textColor: 'text-red-700',
      trend: outOfStockItems > 0 ? 'Critical!' : 'None'
    },
    {
      title: 'Expiring Soon',
      value: expiringSoon,
      icon: '📅',
      color: 'from-accent/40 to-yellow-100',
      borderColor: 'border-accent',
      textColor: 'text-yellow-800',
      trend: 'Within 6 months'
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div 
          key={index}
          className={`bg-gradient-to-br ${card.color} border-2 ${card.borderColor} rounded-xl p-6 shadow-md hover:shadow-lg transition-all`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="text-4xl">{card.icon}</div>
            <div className={`text-4xl font-extrabold ${card.textColor}`}>
              {card.value}
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{card.title}</h3>
          {card.trend && (
            <p className={`text-xs ${card.textColor} font-medium`}>
              {card.trend}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
