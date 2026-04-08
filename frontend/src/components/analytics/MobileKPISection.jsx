import React from 'react';

const MobileKPISection = ({ data }) => {
  const kpis = [
    {
      title: 'Revenue',
      value: `₹${(data.revenue || 0).toLocaleString()}`,
      color: 'bg-green-50',
      borderColor: 'border-green-300',
      valueColor: 'text-green-700',
    },
    {
      title: 'Sales',
      value: (data.sales || 0).toString(),
      color: 'bg-blue-50',
      borderColor: 'border-blue-300',
      valueColor: 'text-blue-700',
    },
    {
      title: 'Avg Order',
      value: `₹${(data.avgOrderValue || 0).toLocaleString()}`,
      color: 'bg-purple-50',
      borderColor: 'border-purple-300',
      valueColor: 'text-purple-700',
    },
    {
      title: 'Margin',
      value: `${(data.profitMargin || 0).toFixed(1)}%`,
      color: 'bg-orange-50',
      borderColor: 'border-orange-300',
      valueColor: 'text-orange-700',
    },
    {
      title: 'Customers',
      value: (data.customers || 0).toString(),
      color: 'bg-gray-50',
      borderColor: 'border-gray-300',
      valueColor: 'text-gray-800',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {kpis.slice(0, 4).map((kpi, index) => (
        <div
          key={index}
          className={`${kpi.color} border-2 ${kpi.borderColor} rounded-lg p-3 shadow-sm`}
        >
          <p className="text-[10px] font-medium text-gray-600 mb-1">{kpi.title}</p>
          <p className={`text-lg md:text-xl font-extrabold ${kpi.valueColor}`}>
            {kpi.value}
          </p>
        </div>
      ))}
      {/* Full width for 5th card */}
      <div
        className={`${kpis[4].color} border-2 ${kpis[4].borderColor} rounded-lg p-3 shadow-sm col-span-2`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium text-gray-600 mb-1">{kpis[4].title}</p>
            <p className={`text-xl md:text-2xl font-extrabold ${kpis[4].valueColor}`}>
              {kpis[4].value}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileKPISection;
