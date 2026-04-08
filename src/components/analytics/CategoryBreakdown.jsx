import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CategoryBreakdown = ({ dateRange = 'week' }) => {
  const [categoryData, setCategoryData] = useState([]);
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
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const { startDate, endDate } = getDateRange();
        
        console.log('CategoryBreakdown dates:', { startDate, endDate, dateRange });
        
        const response = await axios.get(`${API_URL}/analytics/category-breakdown`, {
          params: { startDate, endDate },
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('CategoryBreakdown response:', response.data);
        
        if (response.data.success) {
          const data = response.data.data.categoryData;
          
          console.log('Category data:', data);
          
          // Transform data for chart
          const colors = ['#A5C89E', '#D8E983', '#FFFBB1', '#AEB877', '#8FB388', '#7A9A6B', '#C5D89E', '#B2C88A'];
          const transformedData = data.map((item, index) => ({
            name: item._id || 'Uncategorized',
            value: item.revenue,
            color: colors[index % colors.length],
            quantity: item.quantity,
          }));

          setCategoryData(transformedData);
        }
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [dateRange]);

  const totalSales = categoryData.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-primary-light/30 p-6">
        <div className="flex items-center justify-center h-[250px]">
          <p className="text-gray-500">Loading chart...</p>
        </div>
      </div>
    );
  }

  if (categoryData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-primary-light/30 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-800">Sales by Category</h3>
          <p className="text-sm text-gray-500 mt-1">Distribution across categories</p>
        </div>
        <div className="flex items-center justify-center h-[250px]">
          <p className="text-gray-500">No category data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-primary-light/30 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">Sales by Category</h3>
        <p className="text-sm text-gray-500 mt-1">Distribution across categories</p>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
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
              padding: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']}
            labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{ fontSize: '11px' }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Category List */}
      <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
        {categoryData.map((category, index) => {
          const percentage = ((category.value / totalSales) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-xs text-gray-700 font-medium">{category.name}</span>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-800">₹{category.value.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{percentage}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBreakdown;
