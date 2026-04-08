import React from 'react';

const InventorySummaryCards = ({ 
  totalProducts, 
  totalStock,
  lowStockItems, 
  outOfStockItems
}) => {
  const cards = [
    {
      title: 'Total Products',
      value: totalProducts,
      color: 'bg-blue-50',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-700',
    },
    {
      title: 'Total Stock',
      value: totalStock,
      color: 'bg-purple-50',
      borderColor: 'border-purple-300',
      textColor: 'text-purple-700',
    },
    {
      title: 'Low Stock',
      value: lowStockItems,
      color: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      textColor: 'text-yellow-700',
    },
    {
      title: 'Out of Stock',
      value: outOfStockItems,
      color: 'bg-red-50',
      borderColor: 'border-red-300',
      textColor: 'text-red-700',
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.color} border-2 ${card.borderColor} rounded-lg p-3 shadow-sm`}
        >
          <p className="text-[10px] font-medium text-gray-600 mb-1">{card.title}</p>
          <p className={`text-2xl font-extrabold ${card.textColor}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default InventorySummaryCards;
