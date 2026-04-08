import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MobileProfitAnalysis = ({ profitData, totalRevenue, totalCost, totalProfit, profitMargin, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center justify-center" style={{ height: '180px' }}>
          <p className="text-gray-500 text-sm">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (totalRevenue === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-gray-800">Profit Analysis</h3>
        </div>
        <div className="flex items-center justify-center" style={{ height: '180px' }}>
          <p className="text-gray-500 text-sm">No profit data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Profit Analysis</h3>
          <p className="text-xs text-gray-500 mt-0.5">Revenue vs Cost</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500">Margin</p>
          <p className={`text-sm font-bold ${profitMargin > 20 ? 'text-green-600' : 'text-orange-600'}`}>
            {profitMargin.toFixed(1)}%
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={profitData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="category"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: '#6b7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: '#6b7280' }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '2px solid #A5C89E',
              borderRadius: '8px',
              padding: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value) => [`₹${value.toLocaleString()}`, '']}
            labelStyle={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}
          />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
          <Bar 
            dataKey="revenue" 
            fill="#A5C89E" 
            name="Revenue"
            radius={[3, 3, 0, 0]}
          />
          <Bar 
            dataKey="cost" 
            fill="#FCA5A5" 
            name="Cost"
            radius={[3, 3, 0, 0]}
          />
          <Bar 
            dataKey="profit" 
            fill="#60A5FA" 
            name="Profit"
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-200">
        <div className="text-center">
          <p className="text-[10px] text-gray-500 mb-0.5">Revenue</p>
          <p className="text-xs font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-500 mb-0.5">Cost</p>
          <p className="text-xs font-bold text-red-600">₹{totalCost.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-500 mb-0.5">Profit</p>
          <p className="text-xs font-bold text-blue-600">₹{totalProfit.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default MobileProfitAnalysis;
