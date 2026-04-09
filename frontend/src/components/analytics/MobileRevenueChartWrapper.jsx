import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MobileRevenueChart from './MobileRevenueChart';

const API_URL = import.meta.env.VITE_API_URL;

const MobileRevenueChartWrapper = ({ dateRange }) => {
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
          
          let transformedData = revenueData.map(item => {
            let label;
            if (dateRange === 'today') {
              label = `${item._id.hour}:00`;
            } else if (dateRange === 'week') {
              const date = new Date(item._id.date);
              label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else {
              const date = new Date(item._id.date);
              label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
            return {
              label,
              revenue: item.revenue,
              orders: item.orders,
            };
          });

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

  return <MobileRevenueChart chartData={chartData} loading={loading} />;
};

export default MobileRevenueChartWrapper;
