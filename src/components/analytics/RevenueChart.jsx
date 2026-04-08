import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RevenueChart = ({ dateRange }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await axios.get(`${API_URL}/analytics/revenue-chart`, {
          params: { period: dateRange },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          const revenueData = response.data.data.revenueData;
          
          // Transform data for chart display
          let transformedData = revenueData.map(item => {
            let label;
            if (dateRange === 'today') {
              label = `${item._id.hour}:00`;
            } else if (dateRange === 'week') {
              // Show actual dates for last 7 days
              const date = new Date(item._id.date);
              label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else {
              // Show actual dates for last 30 days
              const date = new Date(item._id.date);
              label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
            return {
              label,
              revenue: item.revenue,
              orders: item.orders,
            };
          });

          // If no data, show empty state
          if (transformedData.length === 0) {
            transformedData = [
              { label: 'No Data', revenue: 0, orders: 0 },
            ];
          }

          setChartData(transformedData);
        }
      } catch (error) {
        console.error('Error fetching revenue chart data:', error);
        setChartData([{ label: 'Error', revenue: 0, orders: 0 }]);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [dateRange]);

  return (
    <div className="bg-white rounded-xl shadow-md border border-primary-light/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Revenue Trend</h3>
          <p className="text-sm text-gray-500 mt-1">Sales performance over time</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary"></span>
          <span className="text-xs text-gray-600 font-medium">Revenue</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-gray-500">Loading chart...</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
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
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(value) => `₹${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '2px solid #A5C89E',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value, name) => {
                if (name === 'revenue') return [`₹${value.toLocaleString()}`, 'Revenue'];
                if (name === 'orders') return [value, 'Orders'];
                return [value, name];
              }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#A5C89E"
              strokeWidth={3}
              dot={{ fill: '#A5C89E', r: 4, strokeWidth: 2, stroke: 'white' }}
              activeDot={{ r: 6, fill: '#8FB388', stroke: 'white', strokeWidth: 2 }}
              fill="url(#colorRevenue)"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default RevenueChart;
