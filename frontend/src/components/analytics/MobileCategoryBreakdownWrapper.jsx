import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MobileCategoryBreakdown from './MobileCategoryBreakdown';

const API_URL = import.meta.env.VITE_API_URL;

const MobileCategoryBreakdownWrapper = ({ dateRange }) => {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

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
        
        const response = await axios.get(`${API_URL}/analytics/category-breakdown`, {
          params: { startDate, endDate },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          const data = response.data.data.categoryData;
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

  return <MobileCategoryBreakdown categoryData={categoryData} loading={loading} />;
};

export default MobileCategoryBreakdownWrapper;
