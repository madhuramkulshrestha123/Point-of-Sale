import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MobileProfitAnalysis from './MobileProfitAnalysis';

const API_URL = import.meta.env.VITE_API_URL;

const MobileProfitAnalysisWrapper = ({ dateRange }) => {
  const [profitData, setProfitData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);
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

  return (
    <MobileProfitAnalysis
      profitData={profitData}
      totalRevenue={totalRevenue}
      totalCost={totalCost}
      totalProfit={totalProfit}
      profitMargin={profitMargin}
      loading={loading}
    />
  );
};

export default MobileProfitAnalysisWrapper;
