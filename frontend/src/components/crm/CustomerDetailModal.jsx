import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CustomerDetailModal = ({ customer, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (customer?._id) {
      fetchCustomerOrders();
    }
  }, [customer]);

  const fetchCustomerOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/customers/${customer._id}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setOrders(response.data.data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 md:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col mx-3 md:mx-0">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg md:text-2xl font-bold text-gray-800 mb-1 truncate">{customer.name}</h2>
              <p className="text-xs md:text-sm text-gray-600">Customer since {formatDate(customer.createdAt)}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white transition-colors flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>

        {/* Customer Info Cards - Mobile Responsive */}
        <div className="p-4 md:p-6 bg-gray-50 border-b border-gray-200">
          {/* First Row - 2 columns on mobile, 4 on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Phone</p>
              <p className="text-sm md:text-base font-semibold text-gray-800 truncate">{customer.phone}</p>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <p className="text-sm md:text-base font-semibold text-gray-800 truncate">{customer.email || 'N/A'}</p>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Total Orders</p>
              <p className="text-sm md:text-base font-semibold text-gray-800">{customer.totalOrders || 0}</p>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Loyalty Points</p>
              <p className="text-sm md:text-base font-semibold text-blue-600">{customer.loyaltyPoints || 0}</p>
            </div>
          </div>

          {/* Second Row - 3 columns, collapsible on mobile */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 mt-3 md:mt-4">
            <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Total Spent</p>
              <p className="text-base md:text-xl font-bold text-purple-700">₹{(customer.totalSpent || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Total Paid</p>
              <p className="text-base md:text-xl font-bold text-green-700">₹{(customer.totalPaid || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Total Due</p>
              <p className="text-base md:text-xl font-bold text-orange-700">₹{(customer.totalDue || 0).toLocaleString()}</p>
            </div>
          </div>

          {customer.address && (
            <div className="mt-3 md:mt-4 bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Address</p>
              <p className="text-sm md:text-base font-semibold text-gray-800">
                {[customer.address.street, customer.address.city, customer.address.state, customer.address.zipCode]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Tabs - Mobile Responsive */}
        <div className="border-b border-gray-200 bg-white">
          <div className="flex gap-2 md:gap-4 px-3 md:px-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-3 px-3 md:px-4 font-semibold border-b-2 transition-colors whitespace-nowrap text-sm md:text-base ${
                activeTab === 'orders'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Order History
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-3 px-3 md:px-4 font-semibold border-b-2 transition-colors whitespace-nowrap text-sm md:text-base ${
                activeTab === 'payments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Payment History
            </button>
          </div>
        </div>

        {/* Tab Content - Mobile Responsive */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading data...</p>
            </div>
          ) : activeTab === 'orders' ? (
            orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No orders found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Desktop Table */}
                <table className="w-full hidden md:table">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Invoice No
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Paid Amount
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Due Amount
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-sm text-gray-700">
                          {order.invoiceNumber || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-700">{formatDate(order.createdAt)}</td>
                        <td className="py-3 px-4 text-gray-700">
                          {order.items?.length || 0} items
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-800">
                          ₹{(order.finalAmount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-green-700">
                          ₹{(order.amountPaid || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-orange-600">
                          ₹{((order.finalAmount - order.amountPaid) || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.paymentStatus === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {orders.map((order) => (
                    <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-mono text-sm font-semibold text-gray-800">{order.invoiceNumber || 'N/A'}</p>
                          <p className="text-xs text-gray-600 mt-1">{formatDate(order.createdAt)}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            order.paymentStatus === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Items:</span>
                          <span className="font-medium">{order.items?.length || 0}</span>
                        </div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-semibold text-gray-800">₹{(order.finalAmount || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Paid:</span>
                          <span className="font-semibold text-green-700">₹{(order.amountPaid || 0).toLocaleString()}</span>
                        </div>
                        {(order.finalAmount - order.amountPaid) > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Due:</span>
                            <span className="font-semibold text-orange-600">₹{((order.finalAmount - order.amountPaid) || 0).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : activeTab === 'payments' ? (
            <div className="overflow-x-auto">
              {/* Desktop Table */}
              <table className="w-full hidden md:table">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Invoice No
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount Paid
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Payment Method
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders
                    .filter((order) => order.amountPaid > 0)
                    .map((order) => (
                      <tr key={`payment-${order._id}`} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-gray-700">{formatDate(order.createdAt)}</td>
                        <td className="py-3 px-4 font-mono text-sm text-gray-700">
                          {order.invoiceNumber || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-green-700">
                          ₹{(order.amountPaid || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {order.paymentMethod || 'N/A'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              
              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {orders
                  .filter((order) => order.amountPaid > 0)
                  .map((order) => (
                    <div key={`payment-${order._id}`} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-mono text-sm font-semibold text-gray-800">{order.invoiceNumber || 'N/A'}</p>
                          <p className="text-xs text-gray-600 mt-1">{formatDate(order.createdAt)}</p>
                        </div>
                        <span className="text-lg font-bold text-green-700">₹{(order.amountPaid || 0).toLocaleString()}</span>
                      </div>
                      {order.paymentMethod && (
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <p className="text-xs text-gray-600">Payment Method</p>
                          <p className="text-sm font-semibold text-gray-800 capitalize">{order.paymentMethod}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailModal;
