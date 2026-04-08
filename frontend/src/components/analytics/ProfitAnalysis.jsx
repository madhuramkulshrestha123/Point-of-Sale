import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProfitAnalysis = ({ dateRange = 'week' }) => {
  const [profitData, setProfitData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);
  const [loading, setLoading] = useState(true);

  // Calculate date range based on selection
  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    if (dateRange === 'today') {
      startDate = now.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    } else if (dateRange === 'week') {
      const startOfWeek = new Date(now);
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startOfWeek.setDate(now.getDate() + mondayOffset);
      startOfWeek.setHours(0, 0, 0, 0);
      startDate = startOfWeek.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    } else if (dateRange === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = startOfMonth.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    }

    return { startDate, endDate };
  };

  useEffect(() => {
    const fetchProfitData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const { startDate, endDate } = getDateRange();
        
        const response = await axios.get(`${API_URL}/analytics/dashboard`, {
          params: { startDate, endDate },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          const data = response.data.data;
          
          setTotalRevenue(data.totalRevenue || 0);
          setTotalProfit(data.totalProfit || 0);
          setTotalCost((data.totalRevenue || 0) - (data.totalProfit || 0));
          setProfitMargin(data.profitMargin || 0);
          
          const categoryBreakdown = [
            { category: 'Revenue', revenue: data.totalRevenue || 0, cost: (data.totalRevenue || 0) - (data.totalProfit || 0), profit: data.totalProfit || 0 },
          ];
          
          setProfitData(categoryBreakdown);
        }
      } catch (error) {
        console.error('Error fetching profit data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfitData();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-primary-light/30 p-6">
        <div className="flex items-center justify-center h-[200px]">
          <p className="text-gray-500">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (totalRevenue === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-primary-light/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Profit Analysis</h3>
            <p className="text-sm text-gray-500 mt-1">Revenue vs Cost breakdown</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-[200px]">
          <p className="text-gray-500">No profit data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-primary-light/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Profit Analysis</h3>
          <p className="text-sm text-gray-500 mt-1">Revenue vs Cost breakdown</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Overall Margin</p>
          <p className={`text-lg font-bold ${profitMargin > 20 ? 'text-green-600' : 'text-orange-600'}`}>
            {profitMargin}%
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={profitData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="category"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#6b7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#6b7280' }}
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
            formatter={(value) => [`₹${value.toLocaleString()}`, '']}
            labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar 
            dataKey="revenue" 
            fill="#A5C89E" 
            name="Revenue"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="cost" 
            fill="#FCA5A5" 
            name="Cost"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="profit" 
            fill="#60A5FA" 
            name="Profit"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
          <p className="text-lg font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Total Cost</p>
          <p className="text-lg font-bold text-red-600">₹{totalCost.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Net Profit</p>
          <p className="text-lg font-bold text-blue-600">₹{totalProfit.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfitAnalysis;
