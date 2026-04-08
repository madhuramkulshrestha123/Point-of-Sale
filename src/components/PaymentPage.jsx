import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [processing, setProcessing] = useState(false);
  const [saleData, setSaleData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get sale data from location state or fetch from ID
    if (location.state?.saleId) {
      fetchSaleDetails(location.state.saleId);
    } else if (location.state?.saleData) {
      setSaleData(location.state.saleData);
    } else {
      setError('No sale information found');
    }
  }, [location.state]);

  const fetchSaleDetails = async (saleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/sales/${saleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setSaleData(response.data.data.sale);
      }
    } catch (err) {
      console.error('Error fetching sale details:', err);
      setError('Failed to load sale details');
    }
  };

  const handlePayment = async () => {
    if (!saleData) return;

    setProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Create payment record
      const response = await axios.post(
        `${API_URL}/payments`,
        {
          saleId: saleData._id,
          invoiceNumber: saleData.invoiceNumber,
          amount: saleData.finalAmount,
          paymentMethod,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Navigate to payments page with success message
        navigate('/payments', {
          state: {
            message: 'Payment completed successfully',
            paymentType: 'completed',
          },
        });
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveAsPending = async () => {
    if (!saleData) return;

    setProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/payments/save-cart`,
        {
          saleId: saleData._id,
          invoiceNumber: saleData.invoiceNumber,
          amount: saleData.finalAmount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        navigate('/payments', {
          state: {
            message: 'Bill saved as pending',
            paymentType: 'pending',
          },
        });
      }
    } catch (err) {
      console.error('Save as pending error:', err);
      setError(err.response?.data?.message || 'Failed to save bill');
    } finally {
      setProcessing(false);
    }
  };

  if (!saleData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-2 md:p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 text-center md:mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 md:text-3xl">Payment</h1>
          <p className="text-sm text-gray-600 md:text-base">Complete your transaction</p>
        </div>

        {/* Bill Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200 md:p-6 md:mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-3 md:text-lg md:mb-4">Bill Summary</h2>
          <div className="space-y-2 md:space-y-3">
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-gray-600">Invoice Number:</span>
              <span className="font-mono font-semibold text-gray-800">
                {saleData.invoiceNumber}
              </span>
            </div>
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-gray-600">Items:</span>
              <span className="font-semibold text-gray-800">
                {saleData.items?.length || 0}
              </span>
            </div>
            <div className="border-t border-gray-300 pt-2 md:pt-3 md:mt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-800 md:text-base">Total Amount:</span>
                <span className="text-2xl font-extrabold text-green-600 md:text-3xl">
                  ₹{saleData.finalAmount?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-base font-bold text-gray-800 mb-3 md:text-lg md:mb-4">Select Payment Method</h2>
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`p-3 rounded-lg border-2 transition-all md:p-6 ${
                paymentMethod === 'cash'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1 md:text-4xl md:mb-2">💵</div>
                <div className="text-xs font-semibold text-gray-800 md:text-sm">Cash</div>
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('upi')}
              className={`p-3 rounded-lg border-2 transition-all md:p-6 ${
                paymentMethod === 'upi'
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1 md:text-4xl md:mb-2">📱</div>
                <div className="text-xs font-semibold text-gray-800 md:text-sm">UPI</div>
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-3 rounded-lg border-2 transition-all md:p-6 ${
                paymentMethod === 'card'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1 md:text-4xl md:mb-2">💳</div>
                <div className="text-xs font-semibold text-gray-800 md:text-sm">Card</div>
              </div>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg md:mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 md:space-y-3">
          <button
            onClick={handlePayment}
            disabled={processing}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-bold text-base hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md md:py-4 md:text-lg"
          >
            {processing ? 'Processing...' : `Pay ₹${saleData.finalAmount?.toLocaleString()}`}
          </button>

          <button
            onClick={handleSaveAsPending}
            disabled={processing}
            className="w-full py-2.5 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed md:py-3"
          >
            Save as Pending
          </button>

          <button
            onClick={() => navigate(-1)}
            disabled={processing}
            className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
