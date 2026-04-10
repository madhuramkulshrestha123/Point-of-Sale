import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartItem from './CartItem';
import usePOSStore from '../store/posStore';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const AddCustomerModal = ({ isOpen, onClose, onCustomerSelect }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !phone) {
      setError('Name and phone number are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/customers`,
        {
          name,
          phone,
          address: {
            street: address,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        onCustomerSelect(response.data.data.customer);
        setName('');
        setPhone('');
        setAddress('');
        onClose();
      }
    } catch (err) {
      console.error('Error creating customer:', err);
      setError(err.response?.data?.message || 'Failed to create customer');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Customer</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter customer name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter mobile number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Customer'}
          </button>
        </form>
      </div>
    </div>
  );
};

const PreviousCustomersModal = ({ isOpen, onClose, onSelectCustomer }) => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      setSearchTerm('');
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/customers?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
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

  const filteredCustomers = customers.filter((customer) => {
    const search = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(search) ||
      customer.phone.toLowerCase().includes(search)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Previous Customers</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or phone number..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            autoFocus
          />
        </div>

        {/* Customers List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading customers...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No customers found' : 'No previous customers'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCustomers.map((customer) => (
                <button
                  key={customer._id}
                  onClick={() => {
                    onSelectCustomer(customer);
                    onClose();
                  }}
                  className="w-full p-4 bg-white border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all text-left"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{customer.name}</h3>
                      <p className="text-sm text-gray-600">📱 {customer.phone}</p>
                      {customer.address?.street && (
                        <p className="text-xs text-gray-500 mt-1">📍 {customer.address.street}</p>
                      )}
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {customer.loyaltyPoints || 0} pts
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CartPanel = ({ onCheckout }) => {
  const navigate = useNavigate();
  const {
    cart,
    customer,
    discount,
    getSubtotal,
    getDiscountAmount,
    getTaxAmount,
    getTaxBreakdown,
    getTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    setDiscount,
    setCustomer
  } = usePOSStore();
  
  const [discountInput, setDiscountInput] = useState(discount.value.toString());
  const [saving, setSaving] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showPreviousCustomersModal, setShowPreviousCustomersModal] = useState(false);
  const [customerDropdownValue, setCustomerDropdownValue] = useState('walk-in');
  
  const handleApplyDiscount = () => {
    const value = parseFloat(discountInput) || 0;
    setDiscount(discount.type, value);
  };
  
  const handleSaveCart = async () => {
    if (cart.length === 0) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      // If customer is registered, create/update customer record
      let customerId = null;
      if (customer.type === 'registered' && customer.name && customer.phone) {
        // Try to find or create the customer
        try {
          const customerResponse = await axios.post(
            `${API_URL}/customers`,
            {
              name: customer.name,
              phone: customer.phone,
              address: customer.address ? { street: customer.address } : {},
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          
          if (customerResponse.data.success) {
            customerId = customerResponse.data.data.customer._id;
          }
        } catch (err) {
          console.error('Error creating customer:', err);
          // Continue without customer ID if creation fails
        }
      }
      
      // Prepare sale data with pending status (no store required)
      const saleData = {
        customer: customerId || (customer.type === 'registered' ? customer.id : null),
        cashier: user?._id || user?.id,
        items: cart.map(item => ({
          product: item.id,
          quantity: item.quantity,
          sellingPrice: item.price,
          costPrice: item.costPrice || 0,
          discount: 0,
          subtotal: item.price * item.quantity,
          taxRate: item.taxRate || 18, // Include tax rate
        })),
        totalAmount: subtotal,
        discount: discountAmount,
        tax: taxAmount,
        finalAmount: total,
        paymentMethod: 'cash',
        notes: 'Saved as pending bill',
        isPending: true,
      };
      
      // Create the sale with pending status
      const response = await axios.post(
        `${API_URL}/sales`,
        saleData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (response.data.success) {
        alert('Bill saved as pending! You can pay later from the Payments page.');
        clearCart();
      }
    } catch (err) {
      console.error('Error saving cart:', err);
      alert(err.response?.data?.message || 'Failed to save bill');
    } finally {
      setSaving(false);
    }
  };
  
  const handleCustomerSelect = (newCustomer) => {
    setCustomer({
      type: 'registered',
      name: newCustomer.name,
      phone: newCustomer.phone,
      id: newCustomer._id,
      address: newCustomer.address
    });
    setCustomerDropdownValue('registered');
  };

  const handleCustomerDropdownChange = (e) => {
    const value = e.target.value;
    setCustomerDropdownValue(value);
    
    if (value === 'walk-in') {
      setCustomer({
        type: 'walk-in',
        name: '',
        phone: '',
        id: null,
        address: ''
      });
    } else if (value === 'registered') {
      setShowPreviousCustomersModal(true);
      // Reset to walk-in until customer is selected
      setCustomerDropdownValue('walk-in');
    }
  };
  
  const handleCheckout = () => {
    if (cart.length > 0) {
      onCheckout();
    }
  };
  
  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const taxAmount = getTaxAmount();
  const taxBreakdown = getTaxBreakdown();
  const total = getTotal();
  
  return (
    <>
    <div className="h-full flex flex-col bg-white border-l border-gray-200 shadow-lg">
      {/* Header - Cleaner Customer Info */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-3 md:p-4 shadow-md">
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <h2 className="text-base font-bold flex items-center gap-2 md:text-lg">
            <span>🧾</span>
            Current Bill
          </h2>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-medium backdrop-blur-sm md:text-xs">
            #{Date.now().toString().slice(-6)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <select
              value={customerDropdownValue}
              onChange={handleCustomerDropdownChange}
              className="w-full px-2 py-1.5 rounded-lg text-sm text-gray-800 border-0 focus:ring-2 focus:ring-green-500 bg-white shadow-sm md:px-3 md:py-2"
            >
              <option value="walk-in">Walk in Customer</option>
              <option value="registered">Previous Customers</option>
            </select>
          </div>
          <button 
            onClick={() => setShowAddCustomerModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 rounded-lg text-sm transition-all font-medium shadow-sm md:px-3 md:py-2"
          >
            + Add
          </button>
        </div>
        
        {/* Display selected customer info */}
        {customer.type === 'registered' && customer.name && (
          <div className="mt-2 bg-white/10 backdrop-blur-sm rounded-lg p-2">
            <p className="text-xs font-medium text-white">{customer.name}</p>
            <p className="text-xs text-white/80">📱 {customer.phone}</p>
            {customer.address?.street && (
              <p className="text-xs text-white/80">📍 {customer.address.street}</p>
            )}
          </div>
        )}
      </div>
      
      {/* Cart Items - Better Spacing */}
      <div className="flex-1 overflow-y-auto p-3 bg-gray-50 md:p-4">
        {cart.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-5xl mb-3 opacity-50 md:text-6xl">🛒</div>
              <p className="text-sm font-medium text-gray-600 md:text-base">Cart is empty</p>
              <p className="text-xs mt-1 text-gray-500 md:text-sm">Click products to add them</p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {cart.map((item, index) => (
                <CartItem
                  key={item.id || `cart-item-${index}`}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={() => removeFromCart(item.id)}
                />
              ))}
            </div>
            
            {/* Clear Cart Button - Subtle */}
            <button
              onClick={clearCart}
              className="w-full mt-3 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 font-medium"
            >
              🗑️ Clear All Items
            </button>
          </>
        )}
      </div>
      
      {/* Billing Summary - Cleaner */}
      <div className="bg-white border-t border-gray-200 p-3 space-y-2 shadow-inner md:p-4 md:space-y-3">
        {/* Discount Section - Compact */}
        <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg border border-blue-100 md:p-2.5">
          <select
            value={discount.type}
            onChange={(e) => setDiscount(e.target.value, parseFloat(discountInput) || 0)}
            className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 font-medium bg-white md:px-2.5 md:py-2"
          >
            <option value="flat">Flat ₹</option>
            <option value="percentage">Percentage %</option>
          </select>
          
          <input
            type="number"
            value={discountInput}
            onChange={(e) => setDiscountInput(e.target.value)}
            onBlur={handleApplyDiscount}
            placeholder="0"
            className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 font-semibold md:px-2.5 md:py-2"
          />
          
          <button
            onClick={handleApplyDiscount}
            className="px-2.5 py-1.5 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-800 transition-all font-medium shadow-sm md:px-3 md:py-2"
          >
            Apply
          </button>
        </div>
        
        {/* Price Breakdown - Better Hierarchy */}
        <div className="space-y-1.5 text-xs md:text-sm md:space-y-2 bg-gray-50 p-2 rounded-lg border border-gray-200 md:p-3">
          <div className="flex justify-between text-gray-700">
            <span className="font-medium">Subtotal:</span>
            <span className="font-bold text-gray-900">₹{subtotal.toLocaleString()}</span>
          </div>
          
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600 bg-green-50 p-1.5 rounded md:p-2">
              <span className="font-medium">Discount ({discount.type === 'percentage' ? `${discount.value}%` : `₹${discount.value}`}):</span>
              <span className="font-bold">-₹{discountAmount.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex justify-between text-gray-700 bg-blue-50 p-1.5 rounded md:p-2">
            <span className="font-medium">GST:</span>
            <span className="font-bold">₹{taxAmount.toLocaleString()}</span>
          </div>
          
          <div className="border-t border-gray-300 pt-2 mt-2 md:border-t-2 md:pt-3 md:mt-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-700 md:text-sm">Total Tax (GST):</span>
              <span className="text-sm font-bold text-blue-700 md:text-base">₹{taxAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="border-t border-gray-300 pt-2 mt-1.5 md:border-t-2 md:pt-3 md:mt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-800 md:text-base">Total Amount:</span>
              <span className="text-lg md:text-2xl font-extrabold text-green-600 bg-green-50 px-2 py-1 md:px-4 md:py-2 rounded-lg border border-green-200">₹{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons - Premium Design */}
      <div className="p-3 bg-gray-50 border-t border-gray-200 space-y-2 md:p-4 md:space-y-3">
        {/* SAVE & CHARGE Buttons - Professional */}
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <button
            onClick={handleSaveCart}
            disabled={cart.length === 0 || saving}
            className="px-3 py-2.5 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-xs md:px-4 md:py-3 md:text-sm"
          >
            {saving ? 'Saving...' : '💾 SAVE'}
          </button>
          
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="px-4 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-xs md:px-6 md:py-3.5 md:text-sm animate-pulse"
          >
            ⚡ CHARGE
          </button>
        </div>
        
        {/* Additional Actions - Compact */}
        <div className="grid grid-cols-3 gap-1.5 md:gap-2">
          <button className="px-2 py-1.5 bg-blue-500 text-white rounded-lg text-[10px] hover:bg-blue-600 transition-colors font-semibold shadow-sm md:px-2.5 md:py-2 md:text-xs">
            📱 WhatsApp
          </button>
          <button className="px-2 py-1.5 bg-purple-500 text-white rounded-lg text-[10px] hover:bg-purple-600 transition-colors font-semibold shadow-sm md:px-2.5 md:py-2 md:text-xs">
            🖨️ Print
          </button>
          <button className="px-2 py-1.5 bg-gray-600 text-white rounded-lg text-[10px] hover:bg-gray-700 transition-colors font-semibold shadow-sm md:px-2.5 md:py-2 md:text-xs">
            ⏸️ Hold
          </button>
        </div>
      </div>
    </div>
    
    {/* Add Customer Modal */}
    <AddCustomerModal
      isOpen={showAddCustomerModal}
      onClose={() => setShowAddCustomerModal(false)}
      onCustomerSelect={handleCustomerSelect}
    />
    
    {/* Previous Customers Modal */}
    <PreviousCustomersModal
      isOpen={showPreviousCustomersModal}
      onClose={() => setShowPreviousCustomersModal(false)}
      onSelectCustomer={handleCustomerSelect}
    />
    </>
  );
};

export default CartPanel;
