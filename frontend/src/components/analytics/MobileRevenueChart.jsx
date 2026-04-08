import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';

const MobileRevenueChart = ({ chartData, loading }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-gray-800">Revenue Trend</h3>
        <p className="text-xs text-gray-500 mt-0.5">Sales performance over time</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ height: '220px' }}>
          <p className="text-gray-500 text-sm">Loading chart...</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A5C89E" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#A5C89E" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="label" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
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
              formatter={(value, name) => {
                if (name === 'revenue') return [`₹${value.toLocaleString()}`, 'Revenue'];
                if (name === 'orders') return [value, 'Orders'];
                return [value, name];
              }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#A5C89E"
              strokeWidth={2.5}
              dot={{ fill: '#A5C89E', r: 3, strokeWidth: 2, stroke: 'white' }}
              activeDot={{ r: 5, fill: '#8FB388', stroke: 'white', strokeWidth: 2 }}
              fill="url(#colorRevenue)"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default MobileRevenueChart;
