import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const PinVerificationModal = ({ isOpen, onClose, onSuccess, actionType, itemName }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify PIN by calling the auth endpoint
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API_URL}/auth/verify-pin`,
        { pin },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setPin('');
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPin('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  // Get action details
  const getActionDetails = () => {
    switch (actionType) {
      case 'category':
        return { title: 'Delete Category', icon: '🗑️', color: 'red' };
      case 'product':
        return { title: 'Delete Product', icon: '🗑️', color: 'red' };
      case 'supplier':
        return { title: 'Delete Supplier', icon: '🗑️', color: 'red' };
      default:
        return { title: 'Delete', icon: '🗑️', color: 'red' };
    }
  };

  const actionDetails = getActionDetails();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{actionDetails.icon}</span>
            <h2 className="text-lg font-bold">{actionDetails.title}</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 font-medium mb-1">
              ⚠️ This action requires authentication
            </p>
            <p className="text-xs text-yellow-700">
              You are about to delete: <span className="font-semibold">"{itemName}"</span>
            </p>
            <p className="text-xs text-yellow-700 mt-2">
              This action cannot be undone.
            </p>
          </div>

          {/* PIN Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter Your 4-Digit PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                required
                maxLength="4"
                pattern="\d{4}"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="****"
                autoFocus
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || pin.length !== 4}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify & Delete'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PinVerificationModal;
