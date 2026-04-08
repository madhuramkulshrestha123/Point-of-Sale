import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SummaryCards from '../components/crm/SummaryCards';
import CustomerTable from '../components/crm/CustomerTable';
import AddCustomerModal from '../components/crm/AddCustomerModal';
import CustomerDetailModal from '../components/crm/CustomerDetailModal';
import MobileCustomerSummaryCards from '../components/crm/MobileCustomerSummaryCards';
import MobileCustomerList from '../components/crm/MobileCustomerList';

const API_URL = 'http://localhost:5000/api';

const CRMPage = () => {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [filterHighValue, setFilterHighValue] = useState(false);
  const [filterPendingDues, setFilterPendingDues] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/customers`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: searchQuery || undefined,
          page: 1,
          limit: 100,
        },
      });

      if (response.data.success) {
        setCustomers(response.data.data.customers);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/customers/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleAddCustomer = async (customerData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/customers`, customerData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        fetchCustomers();
        fetchStats();
        setShowAddModal(false);
      }
    } catch (err) {
      console.error('Error adding customer:', err);
      alert('Error adding customer');
    }
  };

  const handleEditCustomer = async (customerData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/customers/${editingCustomer._id}`,
        customerData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        fetchCustomers();
        fetchStats();
        setEditingCustomer(null);
        setShowAddModal(false);
      }
    } catch (err) {
      console.error('Error updating customer:', err);
      alert('Error updating customer');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        fetchCustomers();
        fetchStats();
      }
    } catch (err) {
      console.error('Error deleting customer:', err);
      alert('Error deleting customer');
    }
  };

  const handleToggleStatus = async (customerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/customers/${customerId}/toggle-status`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        fetchCustomers();
        fetchStats();
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setShowAddModal(true);
  };

  const handleExportReport = () => {
    // Create report data
    const reportData = customers.map((c) => ({
      Name: c.name,
      Phone: c.phone,
      Email: c.email || 'N/A',
      'Total Orders': c.totalOrders || 0,
      'Total Spent': c.totalSpent || 0,
      'Amount Due': c.totalDue || 0,
      'Loyalty Points': c.loyaltyPoints || 0,
      Status: c.status,
      'Last Purchase': c.lastPurchaseDate
        ? new Date(c.lastPurchaseDate).toLocaleDateString('en-IN')
        : 'Never',
    }));

    // Convert to CSV
    const headers = Object.keys(reportData[0]);
    const csv = [
      headers.join(','),
      ...reportData.map((row) =>
        headers.map((header) => JSON.stringify(row[header] || '')).join(',')
      ),
    ].join('\n');

    // Download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    if (statusFilter !== 'all' && customer.status !== statusFilter) {
      return false;
    }
    if (filterHighValue && (customer.totalSpent || 0) < 10000) {
      return false;
    }
    if (filterPendingDues && (customer.totalDue || 0) <= 0) {
      return false;
    }
    return true;
  });

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="p-3 md:p-6">
          {/* Header - Modern Design */}
          <div className="mb-4 md:mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl md:text-3xl font-bold text-white mb-1">Customer Management</h1>
                  <p className="text-xs md:text-sm text-white/80">Manage customers, track orders, and loyalty programs</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-white/90 font-medium">{customers.length} Total Customers</span>
              </div>
            </div>
          </div>

          {/* Action Buttons - Modern Design */}
          <div className="flex gap-2 md:gap-4 mb-4 md:mb-6">
            <button
              onClick={handleExportReport}
              className="flex-1 md:flex-none px-4 md:px-6 py-3 md:py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-sm md:text-base shadow-sm hover:shadow-md group"
              style={{ minHeight: '48px' }}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export</span>
              </div>
            </button>
            <button
              onClick={() => {
                setEditingCustomer(null);
                setShowAddModal(true);
              }}
              className="flex-1 md:flex-none px-4 md:px-6 py-3 md:py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium text-sm md:text-base shadow-md hover:shadow-lg group"
              style={{ minHeight: '48px' }}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Customer</span>
              </div>
            </button>
          </div>

          {/* Mobile Summary Cards */}
          <div className="md:hidden mb-4">
            <MobileCustomerSummaryCards stats={stats} />
          </div>

          {/* Desktop Summary Cards */}
          <div className="hidden md:block">
            <SummaryCards stats={stats} />
          </div>

          {/* Search & Filters - Mobile Responsive */}
          <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 p-3 mb-4 md:p-4 md:mb-6">
            <div className="space-y-3 md:grid md:grid-cols-4 md:gap-4">
              <div className="w-full md:col-span-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchCustomers()}
                  placeholder="Search name, phone, or email..."
                  className="w-full px-3 md:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  style={{ minHeight: '44px' }}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 md:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                style={{ minHeight: '44px' }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterHighValue(!filterHighValue)}
                  className={`flex-1 px-3 md:px-4 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                    filterHighValue
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  High Value
                </button>
                <button
                  onClick={() => setFilterPendingDues(!filterPendingDues)}
                  className={`flex-1 px-3 md:px-4 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                    filterPendingDues
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  Due
                </button>
              </div>
            </div>
          </div>

          {/* Customer Table/List - Mobile Responsive */}
          {loading ? (
            <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading customers...</p>
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="md:hidden">
                <MobileCustomerList
                  customers={filteredCustomers}
                  onView={handleViewCustomer}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteCustomer}
                  onToggleStatus={handleToggleStatus}
                />
              </div>

              {/* Desktop View */}
              <div className="hidden md:block">
                <CustomerTable
                  customers={filteredCustomers}
                  onView={handleViewCustomer}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteCustomer}
                  onToggleStatus={handleToggleStatus}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Customer Modal */}
      <AddCustomerModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingCustomer(null);
        }}
        onSave={editingCustomer ? handleEditCustomer : handleAddCustomer}
        editingCustomer={editingCustomer}
      />

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedCustomer(null);
        }}
      />
    </div>
  );
};

export default CRMPage;
