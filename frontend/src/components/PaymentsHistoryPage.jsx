import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PaymentModal from './PaymentModal';
import ThermalInvoice from './ThermalInvoice';
import MobilePaymentSummaryCards from './PaymentSummaryCards';
import MobileBillList from './BillList';

const API_URL = import.meta.env.VITE_API_URL;

const PaymentsHistoryPage = () => {
  const [activeTab, setActiveTab] = useState('all'); // all, pending, completed
  const [payments, setPayments] = useState([]);
  const [pendingBills, setPendingBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState({
    todayOrders: 0,
    todaySales: 0,
    monthSales: 0,
    totalPending: 0,
  });
  const [dateFilter, setDateFilter] = useState('today'); // today, week, month, 90days, custom
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [selectedBill, setSelectedBill] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSaleId, setPaymentSaleId] = useState(null);
  const [showThermalInvoice, setShowThermalInvoice] = useState(false);
  const [thermalInvoiceSaleId, setThermalInvoiceSaleId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest'); // newest, oldest, price-high, price-low, name-asc, name-desc
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  useEffect(() => {
    fetchData();
    fetchSummary();
    
    // Clear message after 3 seconds
    if (message) {
      setTimeout(() => setMessage(''), 3000);
    }
  }, [activeTab, dateFilter, customDateRange]);

  // Fetch summary with date filters applied
  useEffect(() => {
    fetchSummaryWithFilters();
  }, [activeTab, dateFilter, customDateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Get date range
      const { startDate, endDate } = getDateRange();
      
      if (activeTab === 'pending') {
        // Fetch pending bills
        const response = await axios.get(`${API_URL}/payments/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.data.success) {
          setPendingBills(response.data.data.bills);
        }
      } else {
        // Fetch all payments with date filter
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        const response = await axios.get(`${API_URL}/payments?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.data.success) {
          setPayments(response.data.data.payments);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/analytics/sales-summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setSummary(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const fetchSummaryWithFilters = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Build query params
      const params = new URLSearchParams();
      
      // Add date filters
      const { startDate, endDate } = getDateRange();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      // Add cache-busting timestamp
      params.append('_t', Date.now().toString());
      
      const response = await axios.get(`${API_URL}/analytics/sales-summary?${params.toString()}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      });
      
      if (response.data.success) {
        setSummary(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching filtered summary:', err);
    }
  };

  const handlePayNow = (bill) => {
    setPaymentSaleId(bill._id);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (message) => {
    setMessage(message);
    fetchData(); // Refresh the data
    setTimeout(() => setMessage(''), 3000);
  };

  const handleViewBill = async (bill) => {
    // Fetch full sale details if not already included
    try {
      const token = localStorage.getItem('token');
      let fullBill = bill;
      
      // If the bill doesn't have items, try to fetch from payments endpoint first
      if (!bill.items || bill.items.length === 0) {
        console.log('Bill missing items, checking if it has sale data:', bill.sale?._id || bill._id);
        
        // If this is a payment record with populated sale
        if (bill.sale && bill.sale.items && bill.sale.items.length > 0) {
          console.log('Using sale data from payment record');
          fullBill = bill.sale;
        } else {
          // Try fetching from payments endpoint
          console.log('Fetching from payments endpoint:', bill._id);
          const response = await axios.get(`${API_URL}/payments/${bill._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (response.data.success) {
            console.log('Payment details fetched:', response.data.data.payment);
            fullBill = response.data.data.payment.sale || bill;
          }
        }
      } else {
        console.log('Bill already has items:', bill.items.length, 'items');
      }
      
      setSelectedBill(fullBill);
      setShowBillModal(true);
    } catch (err) {
      console.error('Error fetching bill details:', err);
      console.error('Error response:', err.response?.data);
      console.error('Bill ID:', bill._id);
      
      // Show more specific error message
      const errorMsg = err.response?.data?.message || 'Failed to load bill details';
      alert(`Error: ${errorMsg}\n\nBill may not exist or server error.`);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    let startDate = '';
    let endDate = '';

    switch (dateFilter) {
      case 'today':
        startDate = now.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        startDate = weekStart.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate = monthStart.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case '90days':
        const days90Start = new Date(now);
        days90Start.setDate(now.getDate() - 90);
        startDate = days90Start.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case 'custom':
        if (customDateRange.start) startDate = customDateRange.start;
        if (customDateRange.end) endDate = customDateRange.end;
        break;
      default:
        break;
    }

    return { startDate, endDate };
  };

  const getFilteredAndSortedData = () => {
    let data = activeTab === 'pending' ? [...pendingBills] : [...payments];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      data = data.filter((item) => {
        const saleData = item.sale || item;
        const invoiceNumber = (item.invoiceNumber || saleData.invoiceNumber || '').toLowerCase();
        const customerName = (saleData.customer?.name || 'walk-in').toLowerCase();
        
        return invoiceNumber.includes(search) || customerName.includes(search);
      });
    }

    // Apply sorting
    switch (sortOption) {
      case 'newest':
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'price-high':
        data.sort((a, b) => {
          const priceA = a.finalAmount || a.amount || 0;
          const priceB = b.finalAmount || b.amount || 0;
          return priceB - priceA;
        });
        break;
      case 'price-low':
        data.sort((a, b) => {
          const priceA = a.finalAmount || a.amount || 0;
          const priceB = b.finalAmount || b.amount || 0;
          return priceA - priceB;
        });
        break;
      case 'name-asc':
        data.sort((a, b) => {
          const saleA = a.sale || a;
          const saleB = b.sale || b;
          const nameA = saleA.customer?.name || 'Walk-in';
          const nameB = saleB.customer?.name || 'Walk-in';
          return nameA.localeCompare(nameB);
        });
        break;
      case 'name-desc':
        data.sort((a, b) => {
          const saleA = a.sale || a;
          const saleB = b.sale || b;
          const nameA = saleA.customer?.name || 'Walk-in';
          const nameB = saleB.customer?.name || 'Walk-in';
          return nameB.localeCompare(nameA);
        });
        break;
      default:
        break;
    }

    return data;
  };

  const handlePrintThermalInvoice = (bill) => {
    // For thermal invoice, pass the full sale data directly
    const saleData = bill.sale || bill;
    setSelectedBill(saleData);
    setThermalInvoiceSaleId(null); // Don't use ID when we have data
    setShowThermalInvoice(true);
  };

  // Validate custom date range
  useEffect(() => {
    if (dateFilter === 'custom' && customDateRange.start && customDateRange.end) {
      const startDate = new Date(customDateRange.start);
      const endDate = new Date(customDateRange.end);
      
      if (endDate < startDate) {
        alert('End date must be after start date');
        setCustomDateRange({ ...customDateRange, end: '' });
      }
    }
  }, [customDateRange, dateFilter]);

  const handlePrintBill = () => {
    window.print();
  };

  const handleShareBill = async () => {
    if (navigator.share && selectedBill) {
      try {
        await navigator.share({
          title: `Invoice ${selectedBill.invoiceNumber}`,
          text: `Bill for ₹${selectedBill.finalAmount?.toLocaleString()}`,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`Invoice: ${selectedBill?.invoiceNumber}, Amount: ₹${selectedBill?.finalAmount?.toLocaleString()}`);
      alert('Bill details copied to clipboard!');
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      completed: 'bg-green-100 text-green-800 border-green-300',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getPaymentMethodBadge = (method) => {
    const methodIcons = {
      cash: '💵',
      upi: '📱',
      card: '💳',
    };

    return (
      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold border border-blue-300">
        {methodIcons[method] || ''} {method.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex-1 overflow-auto p-3 md:p-6 pb-20 md:pb-6">
        <div className="max-w-7xl mx-auto">
          {/* Header - Mobile Responsive */}
          <div className="mb-4 md:mb-6">
            <div className="flex items-center justify-between mb-2 md:mb-2">
              <h1 className="text-lg font-bold text-gray-800 md:text-3xl">Payments & Bills</h1>
              <button 
                onClick={() => setShowMobileFilter(!showMobileFilter)}
                className="md:hidden px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
                style={{ minHeight: '44px' }}
              >
                📅 Filter
              </button>
            </div>
            <p className="text-xs text-gray-500 hidden md:block">Manage all your transactions and pending bills</p>
          </div>

          {/* Mobile Filter Dropdown */}
          {showMobileFilter && (
            <div className="md:hidden mb-4 bg-white rounded-lg p-3 border border-gray-200 shadow-sm space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {['today', 'week', 'month', '90days'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setDateFilter(filter);
                      setShowMobileFilter(false);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      dateFilter === filter
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={{ minHeight: '44px' }}
                  >
                    {filter === 'today' ? 'Today' : filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : 'Last 90 Days'}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => {
                    setCustomDateRange({ ...customDateRange, start: e.target.value });
                    setDateFilter('custom');
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  style={{ minHeight: '44px' }}
                />
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => {
                    if (customDateRange.start && e.target.value < customDateRange.start) {
                      alert('End date must be after start date');
                      return;
                    }
                    setCustomDateRange({ ...customDateRange, end: e.target.value });
                    setDateFilter('custom');
                  }}
                  min={customDateRange.start}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  style={{ minHeight: '44px' }}
                />
              </div>
            </div>
          )}

          {/* Summary Cards - Mobile Responsive */}
          <div className="md:hidden mb-4">
            <MobilePaymentSummaryCards summary={summary} dateFilter={dateFilter} />
          </div>

          {/* Desktop Summary Banner */}
          <div className="hidden md:grid md:grid-cols-1 md:lg:grid-cols-4 md:gap-4 md:mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Orders</p>
                  <p className="text-3xl font-bold mt-2">{summary.todayOrders}</p>
                </div>
                <div className="text-4xl opacity-80">📦</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Sales</p>
                  <p className="text-3xl font-bold mt-2">₹{summary.todaySales?.toLocaleString()}</p>
                </div>
                <div className="text-4xl opacity-80">💰</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">{dateFilter === 'today' ? "Today's Sales" : dateFilter === 'week' ? "This Week's Sales" : dateFilter === 'month' ? "This Month's Sales" : dateFilter === '90days' ? "Last 90 Days Sales" : "Selected Period Sales"}</p>
                  <p className="text-3xl font-bold mt-2">₹{summary.monthSales?.toLocaleString()}</p>
                </div>
                <div className="text-4xl opacity-80">📊</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">{dateFilter === 'today' ? "Today's Pending" : dateFilter === 'week' ? "This Week's Pending" : dateFilter === 'month' ? "This Month's Pending" : dateFilter === '90days' ? "Last 90 Days Pending" : "Selected Period Pending"}</p>
                  <p className="text-3xl font-bold mt-2">{summary.totalPending}</p>
                </div>
                <div className="text-4xl opacity-80">⏳</div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm md:text-base font-medium">{message}</p>
            </div>
          )}

          {/* Desktop Date Filter */}
          <div className="hidden md:block mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Filter by:</span>
              <button
                onClick={() => setDateFilter('today')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  dateFilter === 'today'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateFilter('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  dateFilter === 'week'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setDateFilter('month')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  dateFilter === 'month'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setDateFilter('90days')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  dateFilter === '90days'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Last 90 Days
              </button>
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => {
                  setCustomDateRange({ ...customDateRange, start: e.target.value });
                  setDateFilter('custom');
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Start Date"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => {
                  if (customDateRange.start && e.target.value < customDateRange.start) {
                    alert('End date must be after start date');
                    return;
                  }
                  setCustomDateRange({ ...customDateRange, end: e.target.value });
                  setDateFilter('custom');
                }}
                min={customDateRange.start}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="End Date"
              />
            </div>
          </div>

          {/* Tabs - Mobile Responsive */}
          <div className="flex gap-2 mb-4 md:gap-4 md:mb-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 md:flex-none md:px-6 py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base transition-all ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
              style={{ minHeight: '44px' }}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 md:flex-none md:px-6 py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base transition-all ${
                activeTab === 'pending'
                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
              style={{ minHeight: '44px' }}
            >
              Pending
            </button>
          </div>

          {/* Search and Sort Controls - Mobile Responsive */}
          <div className="bg-white rounded-lg shadow-sm p-3 mb-4 border border-gray-200 md:p-4 md:mb-6">
            <div className="space-y-3 md:flex md:items-center md:gap-3">
              {/* Search Bar */}
              <div className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search invoice or customer..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-sm"
                    style={{ minHeight: '44px' }}
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="w-full md:w-auto">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  style={{ minHeight: '44px' }}
                >
                  <option value="newest">🕐 Newest First</option>
                  <option value="oldest">🕐 Oldest First</option>
                  <option value="price-high">💰 Price: High to Low</option>
                  <option value="price-low">💰 Price: Low to High</option>
                  <option value="name-asc">👤 Name: A to Z</option>
                  <option value="name-desc">👤 Name: Z to A</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content - Mobile Responsive */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="md:hidden">
                {(() => {
                  const filteredData = getFilteredAndSortedData();
                  return (
                    <MobileBillList
                      bills={filteredData}
                      onViewBill={handleViewBill}
                      onPayNow={handlePayNow}
                      isPending={activeTab === 'pending'}
                    />
                  );
                })()}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
              {activeTab === 'pending' ? (
                /* Pending Bills Table */
                (() => {
                  const filteredData = getFilteredAndSortedData();
                  
                  return filteredData.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="text-6xl mb-4">✓</div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {searchTerm ? 'No matching bills found' : 'No Pending Bills'}
                      </h3>
                      <p className="text-gray-600">
                        {searchTerm ? 'Try adjusting your search' : 'All bills are paid!'}
                      </p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Invoice #
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredData.map((bill) => (
                          <tr key={bill._id} className="hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => handleViewBill(bill)}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-mono text-sm font-semibold text-gray-800">
                                {bill.invoiceNumber}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600">
                                {new Date(bill.createdAt).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-800">
                                {bill.customer?.name || 'Walk-in'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-bold text-gray-800">
                                ₹{bill.finalAmount?.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge('pending')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handlePayNow(bill)}
                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-sm font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-sm"
                              >
                                Pay Now
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()
              ) : (
                /* All Payments Table */
                (() => {
                  const filteredData = getFilteredAndSortedData();
                  
                  return filteredData.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="text-6xl mb-4">📊</div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {searchTerm ? 'No matching payments found' : 'No Payment History'}
                      </h3>
                      <p className="text-gray-600">
                        {searchTerm ? 'Try adjusting your search' : 'Start making payments to see them here'}
                      </p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Invoice #
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Method
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredData.map((payment) => {
                          // Use sale data if available, otherwise use payment data
                          const saleData = payment.sale || {};
                          const invoiceNumber = payment.invoiceNumber || saleData.invoiceNumber || 'N/A';
                          const paidDate = payment.paidAt || payment.createdAt;
                          const amount = payment.amount || saleData.finalAmount || 0;
                          const status = payment.status || saleData.paymentStatus || 'unknown';
                          
                          return (
                            <tr key={payment._id} className="hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => handleViewBill(payment)}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="font-mono text-sm font-semibold text-gray-800">
                                  {invoiceNumber}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-600">
                                  {new Date(paidDate).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-bold text-gray-800">
                                  ₹{amount.toLocaleString()}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getPaymentMethodBadge(payment.paymentMethod)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(status)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  );
                })()
              )}
            </div>
          </>
          )}
        </div>
      </div>

      {/* Bill Detail Modal - Mobile Responsive */}
      {showBillModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-hidden mx-3 md:mx-0">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 md:px-6 md:py-4 flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg md:text-2xl font-bold truncate">Invoice Details</h2>
                <p className="text-blue-100 text-xs md:text-sm truncate">#{selectedBill.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setShowBillModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-all text-xl md:text-2xl ml-2 flex-shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="overflow-y-auto max-h-[calc(95vh-160px)] md:max-h-[calc(90vh-180px)] p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Customer Info - Mobile Responsive Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Customer</p>
                  <p className="text-sm md:text-base text-gray-800 font-semibold">{selectedBill.customer?.name || 'Walk-in Customer'}</p>
                  {selectedBill.customer?.phone && (
                    <p className="text-gray-600 text-xs md:text-sm mt-1">📞 {selectedBill.customer.phone}</p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Date & Time</p>
                  <p className="text-sm md:text-base text-gray-800 font-semibold">
                    {new Date(selectedBill.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600 text-xs md:text-sm">
                    {new Date(selectedBill.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Items Table - Mobile Responsive */}
              <div>
                <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3">Items Purchased</h3>
                {!selectedBill.items || selectedBill.items.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No items found for this bill</p>
                ) : (
                  <div className="overflow-x-auto">
                    {/* Desktop Table */}
                    <table className="w-full hidden md:table">
                      <thead className="bg-gray-100 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Qty</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Price</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedBill.items.map((item, idx) => {
                          const price = item.sellingPrice || 0;
                          const qty = item.quantity || 0;
                          const total = item.subtotal || (qty * price);
                          
                          return (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <p className="font-medium text-gray-800">{item.productName || item.product?.name || 'N/A'}</p>
                                {item.sku && <p className="text-xs text-gray-500">SKU: {item.sku}</p>}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-700">{qty}</td>
                              <td className="px-4 py-3 text-right text-gray-700">₹{price.toLocaleString()}</td>
                              <td className="px-4 py-3 text-right font-semibold text-gray-800">₹{total.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    
                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                      {selectedBill.items.map((item, idx) => {
                        const price = item.sellingPrice || 0;
                        const qty = item.quantity || 0;
                        const total = item.subtotal || (qty * price);
                        
                        return (
                          <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800">{item.productName || item.product?.name || 'N/A'}</p>
                                {item.sku && <p className="text-xs text-gray-500">SKU: {item.sku}</p>}
                              </div>
                              <span className="font-bold text-gray-800 ml-2">₹{total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs md:text-sm text-gray-600">
                              <span>Qty: {qty}</span>
                              <span>₹{price.toLocaleString()}/unit</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Tax Breakdown - Detailed */}
              {(() => {
                // Calculate tax breakdown by rate
                const taxBreakdownByRate = {};
                selectedBill.items?.forEach(item => {
                  const rate = item.taxRate || item.product?.gstRate || 18;
                  const itemAmount = item.subtotal || ((item.sellingPrice || 0) * (item.quantity || 0));
                  const itemTax = (itemAmount * rate) / 100;
                  
                  if (!taxBreakdownByRate[rate]) {
                    taxBreakdownByRate[rate] = { taxable: 0, tax: 0, cgst: 0, sgst: 0 };
                  }
                  taxBreakdownByRate[rate].taxable += itemAmount;
                  taxBreakdownByRate[rate].tax += itemTax;
                  taxBreakdownByRate[rate].cgst += itemTax / 2;
                  taxBreakdownByRate[rate].sgst += itemTax / 2;
                });
                
                const totalTax = Object.values(taxBreakdownByRate).reduce((sum, data) => sum + data.tax, 0);
                const totalCGST = Object.values(taxBreakdownByRate).reduce((sum, data) => sum + data.cgst, 0);
                const totalSGST = Object.values(taxBreakdownByRate).reduce((sum, data) => sum + data.sgst, 0);
                const hasMultipleRates = Object.keys(taxBreakdownByRate).length > 1;
                
                return totalTax > 0 ? (
                  <div className="bg-blue-50 rounded-lg p-4 md:p-5 border border-blue-200">
                    <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4">GST Breakdown</h3>
                    
                    {/* Tax by Rate */}
                    {hasMultipleRates && (
                      <div className="space-y-3 mb-4">
                        {Object.entries(taxBreakdownByRate).map(([rate, data]) => (
                          <div key={rate} className="bg-white rounded-lg p-3 border border-blue-100">
                            <p className="font-semibold text-gray-800 mb-2 text-sm md:text-base">GST @ {rate}%</p>
                            <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                              <div>
                                <p className="text-gray-600">Taxable</p>
                                <p className="font-semibold text-gray-800">₹{data.taxable.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">CGST @ {rate/2}%</p>
                                <p className="font-semibold text-gray-800">₹{data.cgst.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">SGST @ {rate/2}%</p>
                                <p className="font-semibold text-gray-800">₹{data.sgst.toFixed(2)}</p>
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs md:text-sm text-gray-600">Total GST: <span className="font-bold text-gray-800">₹{data.tax.toFixed(2)}</span></p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Total GST Summary */}
                    <div className="bg-white rounded-lg p-3 md:p-4 border border-blue-200 mt-3">
                      <div className="grid grid-cols-3 gap-2 md:gap-3 text-xs md:text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">Total CGST</p>
                          <p className="font-bold text-gray-800 text-sm md:text-base">₹{totalCGST.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Total SGST</p>
                          <p className="font-bold text-gray-800 text-sm md:text-base">₹{totalSGST.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Total GST</p>
                          <p className="font-bold text-blue-600 text-sm md:text-base">₹{totalTax.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Payment Summary - Mobile Responsive */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 md:p-5 border-2 border-gray-200">
                <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-700 text-sm md:text-base">
                    <span>Subtotal:</span>
                    <span className="font-medium">₹{(selectedBill.totalAmount || selectedBill.subtotal || 0).toLocaleString()}</span>
                  </div>
                  {selectedBill.discount > 0 && (
                    <div className="flex justify-between text-green-600 text-sm md:text-base">
                      <span>Discount:</span>
                      <span className="font-medium">-₹{selectedBill.discount?.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedBill.tax > 0 && Object.keys(taxBreakdownByRate || {}).length === 0 && (
                    <div className="flex justify-between text-gray-700 text-sm md:text-base">
                      <span>Tax (GST):</span>
                      <span className="font-medium">₹{selectedBill.tax?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-gray-300 pt-2 flex justify-between text-base md:text-lg font-bold text-gray-800">
                    <span>Total Amount:</span>
                    <span>₹{(selectedBill.finalAmount || 0).toLocaleString()}</span>
                  </div>
                  {selectedBill.amountPaid > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold text-sm md:text-base">
                      <span>Paid:</span>
                      <span>₹{selectedBill.amountPaid?.toLocaleString()}</span>
                    </div>
                  )}
                  {(selectedBill.paymentStatus === 'pending' || selectedBill.paymentStatus === 'partial') && (
                    <div className="flex justify-between text-red-600 font-semibold text-sm md:text-base">
                      <span>Balance Due:</span>
                      <span>₹{((selectedBill.finalAmount || 0) - (selectedBill.amountPaid || 0)).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method & Status - Mobile Responsive */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {selectedBill.paymentMethod && (
                  <div className="bg-blue-50 rounded-lg p-3 md:p-4 border border-blue-200">
                    <p className="text-xs text-gray-600 mb-1">Payment Method</p>
                    <p className="text-sm md:text-base font-semibold text-gray-800">
                      {getPaymentMethodBadge(selectedBill.paymentMethod)}
                    </p>
                    {selectedBill.transactionId && (
                      <p className="text-xs text-gray-500 mt-2 truncate">TXN: {selectedBill.transactionId}</p>
                    )}
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Payment Status</p>
                  <div className="mt-1">
                    {getStatusBadge(selectedBill.paymentStatus || (selectedBill.finalAmount > (selectedBill.amountPaid || 0) ? 'pending' : 'completed'))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with Actions - Mobile Responsive */}
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 md:px-6 md:py-4">
              <div className="flex flex-wrap gap-2 md:gap-3 justify-end">
                <button
                  onClick={() => setShowBillModal(false)}
                  className="px-4 py-2 md:px-5 md:py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium text-sm md:text-base"
                >
                  Close
                </button>
                <button
                  onClick={() => handlePrintThermalInvoice(selectedBill)}
                  className="px-4 py-2 md:px-5 md:py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium flex items-center gap-2 text-sm md:text-base"
                >
                  <span>🧾</span> <span className="hidden sm:inline">Thermal Bill</span>
                </button>
                <button
                  onClick={handleShareBill}
                  className="px-4 py-2 md:px-5 md:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center gap-2 text-sm md:text-base"
                >
                  <span>📤</span> <span className="hidden sm:inline">Share Bill</span>
                </button>
                <button
                  onClick={handlePrintBill}
                  className="px-4 py-2 md:px-5 md:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium flex items-center gap-2 text-sm md:text-base"
                >
                  <span>🖨️</span> <span className="hidden sm:inline">Print Bill</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        saleId={paymentSaleId}
        onSuccess={handlePaymentSuccess}
      />

      {/* Thermal Invoice Modal */}
      <ThermalInvoice
        isOpen={showThermalInvoice}
        onClose={() => setShowThermalInvoice(false)}
        saleId={null}
        saleData={selectedBill}
      />
    </div>
  );
};

export default PaymentsHistoryPage;
