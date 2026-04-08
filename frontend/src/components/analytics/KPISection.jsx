import React from 'react';

const KPISection = ({ data }) => {
  const kpis = [
    {
      title: 'Total Revenue',
      value: `₹${(data.revenue || 0).toLocaleString()}`,
      icon: '💰',
      color: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-300',
      valueColor: 'text-green-700'
    },
    {
      title: 'Total Sales',
      value: (data.sales || 0).toString(),
      icon: '🛒',
      color: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-300',
      valueColor: 'text-blue-700'
    },
    {
      title: 'Avg Order Value',
      value: `₹${(data.avgOrderValue || 0).toLocaleString()}`,
      icon: '📊',
      color: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-300',
      valueColor: 'text-purple-700'
    },
    {
      title: 'Profit Margin',
      value: `${(data.profitMargin || 0).toFixed(1)}%`,
      icon: '📈',
      color: 'from-orange-50 to-amber-50',
      borderColor: 'border-orange-300',
      valueColor: 'text-orange-700'
    },
    {
      title: 'Total Customers',
      value: (data.customers || 0).toString(),
      icon: '👥',
      color: 'from-primary/20 to-secondary/20',
      borderColor: 'border-primary-light',
      valueColor: 'text-gray-800'
    }
  ];

  return (
    <div className="grid grid-cols-5 gap-6">
      {kpis.map((kpi, index) => (
        <div 
          key={index}
          className={`bg-gradient-to-br ${kpi.color} border-2 ${kpi.borderColor} rounded-xl p-6 shadow-md hover:shadow-lg transition-all`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="text-3xl">{kpi.icon}</div>
          </div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{kpi.title}</h3>
          <p className={`text-2xl font-extrabold ${kpi.valueColor}`}>{kpi.value}</p>
        </div>
      ))}
    </div>
  );
};

export default KPISection;
