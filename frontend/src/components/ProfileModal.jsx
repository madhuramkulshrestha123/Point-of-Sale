import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const ProfileModal = ({ user, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    businessName: user.businessName || '',
    ownerName: user.ownerName || '',
    email: user.email || '',
    phone: user.phone || '',
    street: user.address?.street || '',
    city: user.address?.city || '',
    state: user.address?.state || '',
    zipCode: user.address?.zipCode || '',
    gstNumber: user.gstNumber || '',
    upiId: user.upiId || '',
    currency: user.currency || 'INR',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showPinChange, setShowPinChange] = useState(false);
  const [showResetData, setShowResetData] = useState(false);
  const [resetPin, setResetPin] = useState('');
  const [pinData, setPinData] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Update form data when user prop changes
  useEffect(() => {
    setFormData({
      businessName: user.businessName || '',
      ownerName: user.ownerName || '',
      email: user.email || '',
      phone: user.phone || '',
      street: user.address?.street || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      zipCode: user.address?.zipCode || '',
      gstNumber: user.gstNumber || '',
      upiId: user.upiId || '',
      currency: user.currency || 'INR',
    });
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handlePinChange = (e) => {
    setPinData({
      ...pinData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate GST format if provided
    if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/.test(formData.gstNumber.toUpperCase())) {
      setError('Invalid GST format. Example: 27AABCU9603R1ZM');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/auth/profile`,
        {
          businessName: formData.businessName,
          ownerName: formData.ownerName,
          email: formData.email,
          phone: formData.phone,
          gstNumber: formData.gstNumber ? formData.gstNumber.toUpperCase() : undefined,
          upiId: formData.upiId ? formData.upiId.trim() : undefined,
          currency: formData.currency,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSuccess('Profile updated successfully!');
        localStorage.setItem('user', JSON.stringify(response.data.user));
        onUpdate(response.data.user);
        setTimeout(() => {
          setSuccess('');
          setIsEditing(false);
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // First verify the PIN
      const verifyResponse = await axios.post(
        `${API_URL}/auth/verify-pin`,
        { pin: resetPin },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (verifyResponse.data.success) {
        // PIN verified, now reset the data
        const resetResponse = await axios.delete(
          `${API_URL}/auth/reset-all-bills-payments`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (resetResponse.data.success) {
          setSuccess(resetResponse.data.message || 'All bills and payments reset successfully!');
          setShowResetData(false);
          setResetPin('');
          setTimeout(() => {
            setSuccess('');
          }, 3000);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset data');
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (pinData.newPin.length !== 4 || !/^\d+$/.test(pinData.newPin)) {
      setError('New PIN must be exactly 4 digits');
      return;
    }

    if (pinData.newPin !== pinData.confirmPin) {
      setError('New PINs do not match');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/auth/change-pin`,
        {
          currentPin: pinData.currentPin,
          newPin: pinData.newPin,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSuccess('PIN changed successfully!');
        setPinData({ currentPin: '', newPin: '', confirmPin: '' });
        setTimeout(() => {
          setSuccess('');
          setShowPinChange(false);
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change PIN');
    } finally {
      setLoading(false);
    }
  };

  // Only render when isOpen is true
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white rounded-t-xl">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Business Profile</h2>
          <button
            onClick={() => {
              console.log('Close button clicked');
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold cursor-pointer transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
            aria-label="Close profile modal"
          >
            ×
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {error && (
            <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          {!showPinChange ? (
            <>
              {/* Business Info Display */}
              {!isEditing ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-2xl sm:text-3xl font-bold">
                        {user.businessName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">{user.businessName}</h3>
                      <p className="text-sm sm:text-base text-gray-600">ID: {user.businessId}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{user.role}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="text-xs sm:text-sm text-gray-600">Owner Name</label>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{user.ownerName}</p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm text-gray-600">Email</label>
                      <p className="font-medium text-gray-900 text-sm sm:text-base break-all">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm text-gray-600">Phone</label>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{user.phone}</p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm text-gray-600">GST Number</label>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{user.gstNumber || 'Not Set'}</p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm text-gray-600">UPI ID</label>
                      <p className="font-medium text-gray-900 text-sm sm:text-base break-all">{user.upiId || 'Not configured'}</p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm text-gray-600">Currency</label>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        {user.currency === 'INR' && '₹ INR - Indian Rupee'}
                        {user.currency === 'USD' && '$ USD - US Dollar'}
                        {user.currency === 'EUR' && '€ EUR - Euro'}
                        {user.currency === 'GBP' && '£ GBP - British Pound'}
                        {user.currency === 'AED' && 'د.إ AED - UAE Dirham'}
                        {!user.currency && '₹ INR - Indian Rupee'}
                      </p>
                    </div>
                  </div>

                  {user.address && (
                    <div>
                      <label className="text-xs sm:text-sm text-gray-600">Address</label>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        {[user.address.street, user.address.city, user.address.state, user.address.zipCode]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2 sm:pt-4">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 bg-indigo-600 text-white py-2.5 sm:py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base font-medium"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setShowPinChange(true)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2.5 sm:py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium"
                    >
                      Change PIN
                    </button>
                  </div>
                  
                  {user.role === 'admin' && (
                    <div className="pt-2">
                      <button
                        onClick={() => setShowResetData(true)}
                        className="w-full bg-red-600 text-white py-2.5 sm:py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base font-medium flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Reset All Bills & Payments
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Edit Form */
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Owner Name
                    </label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        GST Number <span className="text-xs text-gray-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 uppercase"
                        placeholder="27AABCU9603R1ZM"
                        maxLength="15"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        UPI ID <span className="text-xs text-gray-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        name="upiId"
                        value={formData.upiId}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 lowercase"
                        placeholder="yourname@upi"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Currency <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="INR">INR - Indian Rupee (₹)</option>
                      <option value="USD">USD - US Dollar ($)</option>
                      <option value="EUR">EUR - Euro (€)</option>
                      <option value="GBP">GBP - British Pound (£)</option>
                      <option value="AED">AED - UAE Dirham (د.إ)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-2"
                      placeholder="Street"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="City"
                      />
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="State"
                      />
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="ZIP"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-indigo-600 text-white py-2.5 sm:py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm sm:text-base font-medium"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2.5 sm:py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : showResetData ? (
            /* Reset Data Confirmation Form */
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 sm:p-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-red-900 mb-2">Warning: Irreversible Action</h3>
                    <p className="text-sm sm:text-base text-red-800 mb-3">
                      You are about to permanently delete <strong>ALL</strong> bills and payment records from the system.
                    </p>
                    <div className="bg-white border border-red-200 rounded-lg p-3 mb-3">
                      <ul className="text-xs sm:text-sm text-red-700 space-y-1">
                        <li className="flex items-start">
                          <span className="font-bold mr-2">•</span>
                          <span>All sales invoices will be permanently deleted</span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-bold mr-2">•</span>
                          <span>All payment records will be removed</span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-bold mr-2">•</span>
                          <span>Customer purchase history will be reset</span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-bold mr-2">•</span>
                          <span>This action CANNOT be undone</span>
                        </li>
                      </ul>
                    </div>
                    <p className="text-xs sm:text-sm text-red-700 font-semibold">
                      Please enter your PIN to confirm this action:
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Enter Your PIN
                  </label>
                  <input
                    type="password"
                    value={resetPin}
                    onChange={(e) => {
                      if (/^\d{0,4}$/.test(e.target.value)) {
                        setResetPin(e.target.value);
                      }
                    }}
                    required
                    maxLength="4"
                    pattern="\d{4}"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-center text-xl tracking-widest"
                    placeholder="****"
                  />
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading || resetPin.length !== 4}
                    className="flex-1 bg-red-600 text-white py-2.5 sm:py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm sm:text-base font-medium"
                  >
                    {loading ? 'Processing...' : 'Reset All Data'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetData(false);
                      setResetPin('');
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-2.5 sm:py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Change PIN Form */
            <form onSubmit={handlePinSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Current PIN
                </label>
                <input
                  type="password"
                  name="currentPin"
                  value={pinData.currentPin}
                  onChange={handlePinChange}
                  required
                  maxLength="4"
                  pattern="\d{4}"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-center text-xl tracking-widest"
                  placeholder="****"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  New PIN
                </label>
                <input
                  type="password"
                  name="newPin"
                  value={pinData.newPin}
                  onChange={handlePinChange}
                  required
                  maxLength="4"
                  pattern="\d{4}"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-center text-xl tracking-widest"
                  placeholder="****"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Confirm New PIN
                </label>
                <input
                  type="password"
                  name="confirmPin"
                  value={pinData.confirmPin}
                  onChange={handlePinChange}
                  required
                  maxLength="4"
                  pattern="\d{4}"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-center text-xl tracking-widest"
                  placeholder="****"
                />
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-2.5 sm:py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm sm:text-base font-medium"
                >
                  {loading ? 'Changing...' : 'Change PIN'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPinChange(false);
                    setPinData({ currentPin: '', newPin: '', confirmPin: '' });
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 sm:py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
