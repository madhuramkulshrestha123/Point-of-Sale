import React from 'react';

const SummaryCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees || 0,
      color: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-300',
      valueColor: 'text-blue-700',
    },
    {
      title: 'Active Employees',
      value: stats.activeEmployees || 0,
      color: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-300',
      valueColor: 'text-green-700',
    },
    {
      title: 'Total Monthly Payroll',
      value: `₹${(stats.totalMonthlyPayroll || 0).toLocaleString()}`,
      color: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-300',
      valueColor: 'text-purple-700',
    },
    {
      title: 'Avg Salary',
      value: `₹${stats.avgSalary ? Math.round(stats.avgSalary).toLocaleString() : 0}`,
      color: 'from-orange-50 to-amber-50',
      borderColor: 'border-orange-300',
      valueColor: 'text-orange-700',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-6 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${card.color} border-2 ${card.borderColor} rounded-xl p-6 shadow-sm hover:shadow-md transition-all`}
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{card.title}</h3>
          <p className={`text-2xl font-extrabold ${card.valueColor}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
