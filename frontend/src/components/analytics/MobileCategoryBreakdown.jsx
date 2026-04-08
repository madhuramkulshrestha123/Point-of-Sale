import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const MobileCategoryBreakdown = ({ categoryData, loading }) => {
  const totalSales = categoryData.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center justify-center" style={{ height: '200px' }}>
          <p className="text-gray-500 text-sm">Loading chart...</p>
        </div>
      </div>
    );
  }

  if (categoryData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-gray-800">Sales by Category</h3>
        </div>
        <div className="flex items-center justify-center" style={{ height: '200px' }}>
          <p className="text-gray-500 text-sm">No category data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="mb-2">
        <h3 className="text-sm font-bold text-gray-800">Sales by Category</h3>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={5}
            dataKey="value"
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '2px solid #A5C89E',
              borderRadius: '8px',
              padding: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']}
            labelStyle={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{ fontSize: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Category List */}
      <div className="space-y-2 mt-3 pt-3 border-t border-gray-200">
        {categoryData.slice(0, 4).map((category, index) => {
          const percentage = ((category.value / totalSales) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-xs text-gray-700 font-medium truncate">{category.name}</span>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-bold text-gray-800">₹{category.value.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500">{percentage}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileCategoryBreakdown;
