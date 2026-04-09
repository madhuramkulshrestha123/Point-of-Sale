import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MobileTopProducts from './MobileTopProducts';

const API_URL = import.meta.env.VITE_API_URL;

const MobileTopProductsWrapper = ({ dateRange }) => {
  const [topProducts, setTopProducts] = useState([]);
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
    const fetchTopProducts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const { startDate, endDate } = getDateRange();
        
        const response = await axios.get(`${API_URL}/analytics/dashboard`, {
          params: { startDate, endDate },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          const products = response.data.data.topProducts || [];
          
          const transformedProducts = products.map((product, index) => ({
            id: product._id,
            rank: index + 1,
            name: product.productName || 'Unknown Product',
            category: product.productDetails?.[0]?.category?.name || 'Uncategorized',
            unitsSold: product.totalQuantity,
            revenue: product.totalRevenue,
            image: product.productDetails?.[0]?.image || null,
          }));

          setTopProducts(transformedProducts);
        }
      } catch (error) {
        console.error('Error fetching top products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, [dateRange]);

  return <MobileTopProducts products={topProducts} loading={loading} />;
};

export default MobileTopProductsWrapper;
