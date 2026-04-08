import React, { useState, useEffect } from 'react';
import axios from 'axios';
import KPISection from '../components/analytics/KPISection';
import MobileKPISection from '../components/analytics/MobileKPISection';
import RevenueChart from '../components/analytics/RevenueChart';
import MobileRevenueChartWrapper from '../components/analytics/MobileRevenueChartWrapper';
import TopProducts from '../components/analytics/TopProducts';
import MobileTopProductsWrapper from '../components/analytics/MobileTopProductsWrapper';
import ProfitAnalysis from '../components/analytics/ProfitAnalysis';
import MobileProfitAnalysisWrapper from '../components/analytics/MobileProfitAnalysisWrapper';
import CategoryBreakdown from '../components/analytics/CategoryBreakdown';
import MobileCategoryBreakdownWrapper from '../components/analytics/MobileCategoryBreakdownWrapper';
import SalesReportPDF from '../components/analytics/SalesReportPDF';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState('week');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Calculate date range based on selection
  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    if (dateRange === 'today') {
      startDate = now.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    } else if (dateRange === 'week') {
      // Start of week (Monday)
      const startOfWeek = new Date(now);
      const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days
      startOfWeek.setDate(now.getDate() + mondayOffset);
      startOfWeek.setHours(0, 0, 0, 0);
      startDate = startOfWeek.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    } else if (dateRange === 'month') {
      // Start of month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = startOfMonth.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    }

    console.log('Date range:', { startDate, endDate });
    return { startDate, endDate };
  };

  // Fetch analytics data from backend
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const { startDate, endDate } = getDateRange();
        
        console.log('Fetching analytics with dates:', { startDate, endDate });
        
        const response = await axios.get(`${API_URL}/analytics/dashboard`, {
          params: {
            startDate,
            endDate,
          },
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Analytics response:', response.data);
        
        if (response.data.success) {
          setAnalyticsData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-y-auto">
      {/* Header - Mobile Responsive */}
      <div className="bg-white border-b border-primary-light/30 px-3 py-3 shadow-sm md:px-8 md:py-6">
        <div className="flex items-center justify-between mb-3 md:mb-6">
          <div>
            <h1 className="text-lg font-bold text-gray-800 mb-0.5 md:text-3xl md:mb-1">Sales Analytics</h1>
            <p className="text-xs text-gray-500 hidden md:block">Track your business performance and insights</p>
          </div>
          <button className="hidden md:block">
            <SalesReportPDF dateRange={dateRange} analyticsData={analyticsData} />
          </button>
          <button 
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="md:hidden px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
            style={{ minHeight: '44px' }}
          >
            📅 Filter
          </button>
        </div>

        {/* Date Filter Dropdown (Mobile) */}
        {showDateFilter && (
          <div className="md:hidden mb-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex gap-2">
              {['today', 'week', 'month'].map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setDateRange(range);
                    setShowDateFilter(false);
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    dateRange === range
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Desktop Date Range Selector */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setDateRange('today')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                dateRange === 'today' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateRange('week')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                dateRange === 'week' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                dateRange === 'month' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-3 space-y-4 md:p-8 md:space-y-6 overflow-y-auto pb-20 md:pb-0">
        {/* Mobile Export Button */}
        {analyticsData && (
          <div className="md:hidden">
            <SalesReportPDF dateRange={dateRange} analyticsData={analyticsData} />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </div>
        ) : analyticsData ? (
          <>
            {/* KPI Cards */}
            <div className="md:hidden">
              <MobileKPISection data={{
                revenue: analyticsData.totalRevenue,
                sales: analyticsData.totalSales,
                avgOrderValue: analyticsData.avgOrderValue,
                profitMargin: analyticsData.profitMargin,
                customers: analyticsData.totalCustomers,
              }} />
            </div>
            <div className="hidden md:block">
              <KPISection data={{
                revenue: analyticsData.totalRevenue,
                sales: analyticsData.totalSales,
                avgOrderValue: analyticsData.avgOrderValue,
                profitMargin: analyticsData.profitMargin,
                customers: analyticsData.totalCustomers,
              }} />
            </div>

            {/* Mobile: Stacked Layout */}
            <div className="md:hidden space-y-4">
              {/* Revenue Chart */}
              <MobileRevenueChartWrapper dateRange={dateRange} />

              {/* Category Breakdown */}
              <MobileCategoryBreakdownWrapper dateRange={dateRange} />

              {/* Top Products */}
              <MobileTopProductsWrapper dateRange={dateRange} />

              {/* Profit Analysis */}
              <MobileProfitAnalysisWrapper dateRange={dateRange} />
            </div>

            {/* Desktop: Grid Layout */}
            <div className="hidden md:block">
              {/* Charts Row */}
              <div className="grid grid-cols-3 gap-6">
                {/* Revenue Chart - Takes 2 columns */}
                <div className="col-span-2">
                  <RevenueChart dateRange={dateRange} />
                </div>

                {/* Category Breakdown */}
                <div className="col-span-1">
                  <CategoryBreakdown dateRange={dateRange} />
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-2 gap-6">
                {/* Top Products */}
                <TopProducts dateRange={dateRange} />

                {/* Profit Analysis */}
                <ProfitAnalysis dateRange={dateRange} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600">No analytics data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
